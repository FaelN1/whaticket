#!/bin/bash

# Caminho temporário para o build
TMP_DIR_FRONT="/home/deploy/cojogos/tmp_frontend"
TMP_DIR_BACK="/home/deploy/cojogos/tmp_backend"

echo "[🧹] Limpando diretório temporário anterior (se existir)..."
rm -rf "$TMP_DIR_FRONT"
rm -rf "$TMP_DIR_BACK"

echo "[📁] Copiando front para diretório temporário..."
cp -r /home/deploy/cojogos/frontend "$TMP_DIR_FRONT"
echo "[📁] Copiando back para diretório temporário..."
cp -r /home/deploy/cojogos/backend "$TMP_DIR_BACK"

echo "[📂] Entrando no diretório temporário front..."
cd "$TMP_DIR_FRONT"

echo "[🧨] Removendo symlink 'public' (se existir)..."
rm -rf public

echo "[🆕] Criando pasta 'public' vazia com index.html mínimo..."
cp -r /home/deploy/cojogos/frontend/public_bkup "$TMP_DIR_FRONT"
mv "$TMP_DIR_FRONT"/public_bkup "$TMP_DIR_FRONT"/public

echo "[🧨] Removendo node_modules (se existir)..."
rm -rf node_modules

echo "[📂] Entrando no diretório temporário back..."
cd "$TMP_DIR_BACK"

echo "[🧨] Removendo node_modules (se existir)..."
rm -rf node_modules

echo "[✅] Processo de copy finalizado com sucesso!"
