# Namagomi Launcher
生ゴミ鯖のランチャー

# How to use
1. `update`ボタンをクリックします
2. 手動でダウンロードする必要のあるmodが表示されたらダウンロードして、`mod files drop here (CLIENT)`にドロップします
3. クライアント用のmodを追加したい場合は`mod files drop here (CLIENT)`にmodsファイルをドロップします（modsフォルダーに直接入れるとアップデート時に消えます）

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