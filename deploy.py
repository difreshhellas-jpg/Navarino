#!/usr/bin/env python3
"""FTP deploy script: uploads new/changed files from the local site folder."""

import argparse
import ftplib
import os
import socket
import sys
from datetime import datetime, timedelta, timezone

# This project lives under a Greek path (…/ΔΟΥΛΕΙΑ/…) and the Windows console
# defaults to cp1252, which cannot encode it — printing the folder name would
# otherwise crash the run. Force UTF-8 on our own streams.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, OSError):
        pass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(SCRIPT_DIR, ".env")

# Directories skipped no matter where they appear under the site folder.
SKIP_DIR_NAMES = {".git", "node_modules"}
# Files skipped no matter where they appear.
SKIP_FILE_NAMES = {".env", ".DS_Store"}
# Extensions skipped everywhere.
SKIP_EXTENSIONS = {".py"}
# Directories skipped only at the root of the site folder (leading "/" in the spec).
SKIP_TOP_LEVEL_DIRS = {"raw-assets"}

MTIME_TOLERANCE = timedelta(seconds=2)


class DeployError(Exception):
    pass


def load_env(path):
    if not os.path.isfile(path):
        raise DeployError(
            f".env not found at {path}. Copy .env.example to .env and fill in your FTP credentials."
        )
    env = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            env[key] = value
    return env


def load_config():
    env = load_env(ENV_PATH)
    required = ["FTP_HOST", "FTP_USER", "FTP_PASSWORD", "FTP_REMOTE_DIR"]
    missing = [key for key in required if not env.get(key)]
    if missing:
        raise DeployError(f"Missing required keys in .env: {', '.join(missing)}")

    # A present-but-empty LOCAL_DIR= must still mean "out"; env.get's default only
    # covers a missing key, and "" would resolve to the project root and upload sources.
    local_dir = env.get("LOCAL_DIR") or "out"
    if not os.path.isabs(local_dir):
        local_dir = os.path.join(SCRIPT_DIR, local_dir)
    local_dir = os.path.normpath(local_dir)
    if not os.path.isdir(local_dir):
        raise DeployError(f"Local site folder not found: {local_dir}")

    remote_dir = "/" + env["FTP_REMOTE_DIR"].strip("/")
    if remote_dir.strip("/").isdigit():
        raise DeployError(
            f"FTP_REMOTE_DIR is {env['FTP_REMOTE_DIR']!r} — that looks like a port number, "
            "not a directory. It should be the web root, e.g. public_html."
        )

    return {
        "host": env["FTP_HOST"],
        "user": env["FTP_USER"],
        "password": env["FTP_PASSWORD"],
        "remote_dir": remote_dir,
        "local_dir": local_dir,
    }


def remote_join(*parts):
    cleaned = [p.strip("/") for p in parts if p and p.strip("/")]
    return "/" + "/".join(cleaned)


def connect(config):
    try:
        ftp = ftplib.FTP(config["host"], timeout=30)
        ftp.login(config["user"], config["password"])
        ftp.set_pasv(True)
        ftp.voidcmd("TYPE I")
        return ftp
    except socket.gaierror as e:
        raise DeployError(f"Could not resolve host '{config['host']}': {e}")
    except (socket.timeout, TimeoutError):
        raise DeployError(f"Connection to '{config['host']}' timed out.")
    except ConnectionRefusedError:
        raise DeployError(f"Connection to '{config['host']}' was refused.")
    except ftplib.error_perm as e:
        raise DeployError(f"FTP login failed: {e}")
    except ftplib.all_errors as e:
        raise DeployError(f"Could not connect to FTP server: {e}")


def is_skipped_dir(name, is_root):
    if name in SKIP_DIR_NAMES:
        return True
    if is_root and name in SKIP_TOP_LEVEL_DIRS:
        return True
    return False


def is_skipped_file(name):
    if name in SKIP_FILE_NAMES:
        return True
    if os.path.splitext(name)[1].lower() in SKIP_EXTENSIONS:
        return True
    return False


def parse_mdtm(response):
    # Response looks like "213 20230101120000" or "213 20230101120000.123"
    payload = response.split(None, 1)[1].strip()
    payload = payload.split(".")[0]
    return datetime.strptime(payload, "%Y%m%d%H%M%S").replace(tzinfo=timezone.utc)


def get_remote_info(ftp, remote_path):
    """Returns (size, mtime) for remote_path, or (None, None) if it doesn't exist."""
    try:
        size = ftp.size(remote_path)
    except ftplib.error_perm:
        return None, None

    try:
        mtime = parse_mdtm(ftp.sendcmd("MDTM " + remote_path))
    except ftplib.error_perm:
        mtime = None

    return size, mtime


def needs_upload(local_path, remote_size, remote_mtime, size_only=False):
    if remote_size is None:
        return True, "new"

    local_size = os.path.getsize(local_path)
    if local_size != remote_size:
        return True, "changed (size)"

    if size_only:
        # A rebuild rewrites every asset's mtime even when the bytes are identical,
        # so the timestamp checks below would re-upload the whole site. Size-only
        # trusts matching sizes and skips them.
        return False, "up to date"

    if remote_mtime is None:
        return True, "changed (unknown remote time)"

    local_mtime = datetime.fromtimestamp(os.path.getmtime(local_path), tz=timezone.utc)
    if local_mtime - remote_mtime > MTIME_TOLERANCE:
        return True, "changed (modified)"

    return False, "up to date"


def scan(ftp, config, size_only=False):
    local_dir = config["local_dir"]
    remote_root = config["remote_dir"]
    to_upload = []

    for dirpath, dirnames, filenames in os.walk(local_dir):
        rel_dir = os.path.relpath(dirpath, local_dir)
        is_root = rel_dir == "."
        dirnames[:] = sorted(d for d in dirnames if not is_skipped_dir(d, is_root))

        for filename in sorted(filenames):
            if is_skipped_file(filename):
                continue

            local_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(local_path, local_dir).replace(os.sep, "/")
            remote_path = remote_join(remote_root, rel_path)

            remote_size, remote_mtime = get_remote_info(ftp, remote_path)
            upload, reason = needs_upload(local_path, remote_size, remote_mtime, size_only)
            if upload:
                to_upload.append(
                    {
                        "local_path": local_path,
                        "remote_path": remote_path,
                        "rel_path": rel_path,
                        "reason": reason,
                        "size": os.path.getsize(local_path),
                    }
                )

    return to_upload


def print_summary(to_upload, config):
    print()
    print(f"Local folder:  {config['local_dir']}")
    print(f"Remote target: {config['host']}:{config['remote_dir']}")
    print()

    if not to_upload:
        print("Nothing to upload — remote is already up to date.")
        return

    total_bytes = sum(item["size"] for item in to_upload)
    print(f"{len(to_upload)} file(s) to upload ({total_bytes:,} bytes):")

    LIMIT = 50
    for item in to_upload[:LIMIT]:
        print(f"  [{item['reason']}] {item['rel_path']}")
    remaining = len(to_upload) - LIMIT
    if remaining > 0:
        print(f"  ... and {remaining} more")
    print()


def ensure_remote_dir(ftp, remote_dir_path, created_cache):
    if remote_dir_path in created_cache:
        return
    parts = [p for p in remote_dir_path.strip("/").split("/") if p]
    current = ""
    for part in parts:
        current += "/" + part
        if current in created_cache:
            continue
        try:
            ftp.mkd(current)
        except ftplib.error_perm:
            pass  # already exists (or no permission to create — mkd/stor will surface that)
        created_cache.add(current)


def reconnect(config):
    return connect(config)


def upload_files(ftp, config, to_upload):
    created_dirs = set()
    succeeded = []
    failed = []

    for item in to_upload:
        remote_dir_path = os.path.dirname(item["remote_path"])
        try:
            ensure_remote_dir(ftp, remote_dir_path, created_dirs)
            with open(item["local_path"], "rb") as f:
                ftp.storbinary("STOR " + item["remote_path"], f)
            print(f"  uploaded  {item['rel_path']}")
            succeeded.append(item)
        except ftplib.all_errors as e:
            print(f"  FAILED    {item['rel_path']}: {e}")
            # Try one reconnect in case the control connection dropped, then retry once.
            try:
                ftp = reconnect(config)
                ensure_remote_dir(ftp, remote_dir_path, created_dirs)
                with open(item["local_path"], "rb") as f:
                    ftp.storbinary("STOR " + item["remote_path"], f)
                print(f"  uploaded  {item['rel_path']} (after reconnect)")
                succeeded.append(item)
            except (ftplib.all_errors, OSError) as retry_error:
                print(f"  FAILED    {item['rel_path']} again: {retry_error}")
                failed.append(item)
        except OSError as e:
            print(f"  FAILED    {item['rel_path']}: could not read local file: {e}")
            failed.append(item)

    return ftp, succeeded, failed


def main():
    parser = argparse.ArgumentParser(description="Upload changed site files over FTP.")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be uploaded without connecting to upload anything.",
    )
    parser.add_argument(
        "--size-only",
        action="store_true",
        help="Only upload files that are new or whose size differs, ignoring timestamps.",
    )
    args = parser.parse_args()

    try:
        config = load_config()
    except DeployError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        ftp = connect(config)
    except DeployError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        to_upload = scan(ftp, config, size_only=args.size_only)
    except ftplib.all_errors as e:
        print(f"Error: lost connection while comparing files: {e}", file=sys.stderr)
        ftp.close()
        sys.exit(1)

    print_summary(to_upload, config)

    if args.dry_run:
        print("Dry run — no files were uploaded.")
        ftp.close()
        return

    if not to_upload:
        ftp.close()
        return

    answer = input("Proceed with upload? [y/N] ").strip().lower()
    if answer not in ("y", "yes"):
        print("Aborted.")
        ftp.close()
        return

    print()
    ftp, succeeded, failed = upload_files(ftp, config, to_upload)

    try:
        ftp.quit()
    except ftplib.all_errors:
        ftp.close()

    print()
    print(f"Done: {len(succeeded)} uploaded, {len(failed)} failed.")
    if failed:
        print("Failed files:")
        for item in failed:
            print(f"  {item['rel_path']}")
        sys.exit(1)


if __name__ == "__main__":
    main()
