# 構成
Next.jsで開発し，Vercelに公開する

# eslint-plugin-securityのバージョンを2に固定する
eslint-plugin-securityのバージョン3以降は，eslintのFlat Configと対応しているので，eslint-plugin-securityのバージョンを2に固定する

# security/recommendedのルールの書き方
security/recommendedを読み込むとエラーが出るので，推奨ルールを.eslintrc.jsonに直接書いている．