# jm-passport-weapp

passport service for weapp

依赖 jm-weapp jm-user jm-sso

## 配置参数

基本配置 请参考 [jm-server] (https://github.com/jm-root/jm-server)

gateway Gateway服务器Uri

weapp_uri weapp服务Uri, 相对于gateway, 例如 /weapp

force_unionid [0] 是否强制获取unionid, 0：不强制 1：强制

db 数据库uri
