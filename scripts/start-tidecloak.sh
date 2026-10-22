#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
env_file="${repo_root}/infra/tidecloak/.env"
compose_file="${repo_root}/infra/tidecloak/compose.yaml"
data_dir="${repo_root}/infra/tidecloak/data"

mkdir -p "${data_dir}"

if [[ ! -f "${env_file}" ]]; then
  umask 077
  password="$(openssl rand -hex 24)"
  printf 'ENTRUTH_TIDE_ADMIN_USERNAME=admin\nENTRUTH_TIDE_ADMIN_PASSWORD=%s\n' "${password}" > "${env_file}"
fi

docker compose --env-file "${env_file}" -f "${compose_file}" up -d
printf 'TideCloak is starting at http://localhost:8080/\nBootstrap credentials are in %s (keep this file private).\n' "${env_file}"
