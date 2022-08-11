[![Launcher Build](https://github.com/NamagomiNetwork/Namagomi-Launcher.old/actions/workflows/build_check.yml/badge.svg)](https://github.com/NamagomiNetwork/Namagomi-Launcher.old/actions/workflows/build_check.yml)
# Namagomi Launcher
生ゴミ鯖のランチャー

# Download
[ここ](https://github.com/NamagomiNetwork/Namagomi-Launcher/releases)から最新版をダウンロードしてインストール  
色々警告が出ますが私を信頼するなら実行してください

# How to use
1. `update`ボタンをクリックします
2. 手動でダウンロードする必要のあるmodが表示されたらダウンロードして、`mod files drop here (CLIENT)`にドロップします
3. クライアント用のmodを追加したい場合は`mod files drop here (CLIENT)`にmodsファイルをドロップします（modsフォルダーに直接入れるとアップデート時に消えます）

# Q&A
Q. クラッシュしてこの画像が表示される！  
![image](https://user-images.githubusercontent.com/71992891/172034709-a156fec0-bade-4704-ace0-568bc946336a.png)  
A. [forge公式サイト](https://files.minecraftforge.net/net/minecraftforge/forge/index_1.12.2.html)から`1.12.2-forge-14.23.5.2860`をダウンロードしてインストールしてください。

Q. 起動構成が作られない！  
A. 現在不具合により一部のユーザーで起動構成が作られないことがあります。  
<details>
  <summary>対処法</summary>
  1. Minecraft Launcherを開き、起動構成タブの新規作成を押します。<br>
  2. 名前をわかりやすい名前（生ゴミ鯖など）にします。<br>
  3. バージョンを release 1.12.2-forge-14.23.5.2860 にします（forgeをインストールしてない場合は選択できません）<br>
  4. Namagomi Launcherを開き、OpenFolderボタンをクリックします。<br>
  5. 4で開いたフォルダのパスをコピーし、1で作成した起動構成のゲームディレクトリに入力します。<br>
  6. 右下にある作成ボタンを押して起動構成を作成します。<br>
  7. 一番下に新しい起動構成が作成されます。<br>
</details>

# build

## Environment
```shell
> npm --version
8.5.5
> tsc --version
Version 4.6.4
```

## Windows
```shell
npm install
npm run publish-win-x64
```

## Mac
```shell
npm install
npm run publish-mac-x64
```

## Linux
```shell
npm install
npm run publish-linux
```
