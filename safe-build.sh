#!/bin/bash

# Caminho temporário para o build
TMP_DIR="/home/deploy/cojogos/tmp_frontend"

echo "[🧹] Limpando diretório temporário anterior (se existir)..."
rm -rf "$TMP_DIR"

echo "[📁] Copiando projeto para diretório temporário..."
cp -r /home/deploy/cojogos/frontend "$TMP_DIR"

echo "[📂] Entrando no diretório temporário..."
cd "$TMP_DIR"

echo "[🧨] Removendo symlink 'public' (se existir)..."
rm -rf public

echo "[🆕] Criando pasta 'public' vazia com index.html mínimo..."
cp -r /home/deploy/cojogos/frontend/public_bkup "$TMP_DIR"
mv "$TMP_DIR"/public_bkup "$TMP_DIR"/public

# echo "[📦] Instalando dependências (npm install)..."
# npm install --force

echo "[⚙️] Executando build (npm run build)..."
npm run build

echo "[📤] Copiando pasta 'build' para o projeto original como 'build-new'..."
cp -r build /home/deploy/cojogos/frontend/build-new
BUILD_NAME="build-$(date +%Y%m%d-%H%M%S)"
mv /home/deploy/cojogos/frontend/build /home/deploy/cojogos/frontend/$BUILD_NAME
mv /home/deploy/cojogos/frontend/build-new /home/deploy/cojogos/frontend/build

echo "[✅] Processo de build finalizado com sucesso!"
