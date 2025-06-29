#!/bin/bash

# カラーコードの定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_manual() {
    echo -e "${PURPLE}[MANUAL]${NC} $1"
}

# エラーハンドリング
set -e
trap 'log_error "セットアップに失敗しました。"; exit 1' ERR

# .env.localから設定を読み込み
if [ ! -f ".env.local" ]; then
    log_error ".env.local ファイルが見つかりません"
    exit 1
fi

# 環境変数を読み込み
source .env.local

# プロジェクト設定
PROJECT_ID=${GCP_PROJECT_ID}
REGION="asia-northeast1"

# 必須環境変数の確認
if [ -z "$PROJECT_ID" ]; then
    log_error "GCP_PROJECT_ID が .env.local に設定されていません"
    exit 1
fi

if [ -z "$CUSTOM_DOMAIN" ]; then
    log_error "CUSTOM_DOMAIN が .env.local に設定されていません"
    exit 1
fi

if [ -z "$SERVICE_NAME" ]; then
    log_error "SERVICE_NAME が .env.local に設定されていません"
    exit 1
fi

log_info "Tech-Master カスタムドメイン設定を開始します"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 プロジェクト: $PROJECT_ID"
echo "🌐 カスタムドメイン: $CUSTOM_DOMAIN"
echo "🚀 Cloud Runサービス: $SERVICE_NAME"
echo "📍 リージョン: $REGION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 必要なAPIの有効化
log_info "必要なGoogle Cloud APIを有効化しています..."
gcloud services enable compute.googleapis.com --project=$PROJECT_ID
gcloud services enable certificatemanager.googleapis.com --project=$PROJECT_ID
gcloud services enable dns.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudresourcemanager.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID

# Cloud Runサービスの確認
log_info "Cloud Runサービスの存在を確認しています..."
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$SERVICE_URL" ]; then
    log_error "Cloud Runサービス '$SERVICE_NAME' が見つかりません。先にアプリをデプロイしてください。"
    exit 1
fi

log_success "Cloud Runサービスが見つかりました: $SERVICE_URL"

# Cloud DNSマネージドゾーンの作成
log_info "Cloud DNSマネージドゾーンを作成しています..."
ZONE_NAME=$(echo $CUSTOM_DOMAIN | sed 's/\./-/g')

# 既存のゾーンをチェック
EXISTING_ZONE=$(gcloud dns managed-zones list --filter="name:$ZONE_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_ZONE" ]; then
    gcloud dns managed-zones create $ZONE_NAME \
        --description="DNS zone for $CUSTOM_DOMAIN" \
        --dns-name="$CUSTOM_DOMAIN." \
        --project=$PROJECT_ID
    log_success "Cloud DNSマネージドゾーンを作成しました: $ZONE_NAME"
else
    log_info "Cloud DNSマネージドゾーンは既に存在します: $ZONE_NAME"
fi

# ネームサーバーの取得と表示
NAMESERVERS=$(gcloud dns managed-zones describe $ZONE_NAME --format="value(nameServers[].join(' '))" --project=$PROJECT_ID)

echo ""
log_manual "=== 手動設定が必要: ドメインレジストラでネームサーバー設定 ==="
echo "🌐 ドメインプロバイダ（$CUSTOM_DOMAIN を購入したサイト）で以下のネームサーバーを設定してください："
echo ""
for ns in $NAMESERVERS; do
    echo "   📍 $ns"
done
echo ""
echo "📝 設定方法（一般的）："
echo "   1. ドメインプロバイダのコントロールパネルにログイン"
echo "   2. $CUSTOM_DOMAIN のDNS設定画面に移動"
echo "   3. 'Custom nameservers' または 'DNS管理' を選択"
echo "   4. 上記4つのネームサーバーを設定"
echo "   5. 変更を保存（反映まで最大48時間）"
echo ""

# Google Cloud Load Balancer用の静的IPアドレスを作成
log_info "グローバル静的IPアドレスを作成しています..."
IP_NAME="${SERVICE_NAME}-global-ip"
EXISTING_IP=$(gcloud compute addresses list --global --filter="name:$IP_NAME" --format="value(address)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_IP" ]; then
    gcloud compute addresses create $IP_NAME \
        --global \
        --project=$PROJECT_ID
    STATIC_IP=$(gcloud compute addresses describe $IP_NAME --global --format="value(address)" --project=$PROJECT_ID)
    log_success "静的IPアドレスを作成しました: $STATIC_IP"
else
    STATIC_IP=$EXISTING_IP
    log_info "静的IPアドレスは既に存在します: $STATIC_IP"
fi

# DNS Aレコードの作成
log_info "DNS Aレコードを作成しています..."
# 既存のレコードをチェック
EXISTING_A_RECORD=$(gcloud dns record-sets list --zone=$ZONE_NAME --filter="type:A AND name:$CUSTOM_DOMAIN." --format="value(rrdatas[0])" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_A_RECORD" ]; then
    gcloud dns record-sets create "$CUSTOM_DOMAIN." \
        --zone=$ZONE_NAME \
        --type=A \
        --ttl=300 \
        --rrdatas=$STATIC_IP \
        --project=$PROJECT_ID
    log_success "DNS Aレコードを作成しました: $CUSTOM_DOMAIN -> $STATIC_IP"
else
    if [ "$EXISTING_A_RECORD" != "$STATIC_IP" ]; then
        # レコードを更新
        gcloud dns record-sets update "$CUSTOM_DOMAIN." \
            --zone=$ZONE_NAME \
            --type=A \
            --ttl=300 \
            --rrdatas=$STATIC_IP \
            --project=$PROJECT_ID
        log_success "DNS Aレコードを更新しました: $CUSTOM_DOMAIN -> $STATIC_IP"
    else
        log_info "DNS Aレコードは既に正しく設定されています"
    fi
fi

# SSL証明書の作成
log_info "Google Managed SSL証明書を作成しています..."
CERT_NAME="${SERVICE_NAME}-ssl-cert"
EXISTING_CERT=$(gcloud compute ssl-certificates list --filter="name:$CERT_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_CERT" ]; then
    gcloud compute ssl-certificates create $CERT_NAME \
        --domains=$CUSTOM_DOMAIN \
        --global \
        --project=$PROJECT_ID
    log_success "SSL証明書を作成しました: $CERT_NAME"
else
    log_info "SSL証明書は既に存在します: $CERT_NAME"
fi

# NEGの作成（Cloud Run用）
log_info "Network Endpoint Group (NEG) を作成しています..."
NEG_NAME="${SERVICE_NAME}-neg"
EXISTING_NEG=$(gcloud compute network-endpoint-groups list --filter="name:$NEG_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_NEG" ]; then
    gcloud compute network-endpoint-groups create $NEG_NAME \
        --region=$REGION \
        --network-endpoint-type=serverless \
        --cloud-run-service=$SERVICE_NAME \
        --project=$PROJECT_ID
    log_success "Network Endpoint Groupを作成しました: $NEG_NAME"
else
    log_info "Network Endpoint Groupは既に存在します: $NEG_NAME"
fi

# バックエンドサービスの作成
log_info "バックエンドサービスを作成しています..."
BACKEND_SERVICE_NAME="${SERVICE_NAME}-backend-service"
EXISTING_BACKEND=$(gcloud compute backend-services list --global --filter="name:$BACKEND_SERVICE_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_BACKEND" ]; then
    # Serverless NEGにはprotocolを指定しない
    gcloud compute backend-services create $BACKEND_SERVICE_NAME \
        --global \
        --load-balancing-scheme=EXTERNAL \
        --project=$PROJECT_ID
        
    # NEGをバックエンドに追加
    gcloud compute backend-services add-backend $BACKEND_SERVICE_NAME \
        --global \
        --network-endpoint-group=$NEG_NAME \
        --network-endpoint-group-region=$REGION \
        --project=$PROJECT_ID
    
    log_success "バックエンドサービスを作成しました: $BACKEND_SERVICE_NAME"
else
    log_info "バックエンドサービスは既に存在します: $BACKEND_SERVICE_NAME"
fi

# URL マップの作成
log_info "URL マップを作成しています..."
URL_MAP_NAME="${SERVICE_NAME}-url-map"
EXISTING_URL_MAP=$(gcloud compute url-maps list --filter="name:$URL_MAP_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_URL_MAP" ]; then
    gcloud compute url-maps create $URL_MAP_NAME \
        --default-service=$BACKEND_SERVICE_NAME \
        --global \
        --project=$PROJECT_ID
    log_success "URL マップを作成しました: $URL_MAP_NAME"
else
    log_info "URL マップは既に存在します: $URL_MAP_NAME"
fi

# HTTPSプロキシの作成
log_info "HTTPSプロキシを作成しています..."
HTTPS_PROXY_NAME="${SERVICE_NAME}-https-proxy"
EXISTING_HTTPS_PROXY=$(gcloud compute target-https-proxies list --filter="name:$HTTPS_PROXY_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_HTTPS_PROXY" ]; then
    gcloud compute target-https-proxies create $HTTPS_PROXY_NAME \
        --ssl-certificates=$CERT_NAME \
        --url-map=$URL_MAP_NAME \
        --global \
        --project=$PROJECT_ID
    log_success "HTTPSプロキシを作成しました: $HTTPS_PROXY_NAME"
else
    log_info "HTTPSプロキシは既に存在します: $HTTPS_PROXY_NAME"
fi

# グローバル転送ルールの作成（HTTPS）
log_info "HTTPS転送ルールを作成しています..."
HTTPS_FORWARDING_RULE_NAME="${SERVICE_NAME}-https-forwarding-rule"
EXISTING_HTTPS_RULE=$(gcloud compute forwarding-rules list --global --filter="name:$HTTPS_FORWARDING_RULE_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_HTTPS_RULE" ]; then
    gcloud compute forwarding-rules create $HTTPS_FORWARDING_RULE_NAME \
        --address=$IP_NAME \
        --global \
        --target-https-proxy=$HTTPS_PROXY_NAME \
        --ports=443 \
        --project=$PROJECT_ID
    log_success "HTTPS転送ルールを作成しました: $HTTPS_FORWARDING_RULE_NAME"
else
    log_info "HTTPS転送ルールは既に存在します: $HTTPS_FORWARDING_RULE_NAME"
fi

# HTTP to HTTPS リダイレクト設定
log_info "HTTP to HTTPS リダイレクトを設定しています..."
HTTP_FORWARDING_RULE_NAME="${SERVICE_NAME}-http-forwarding-rule"
EXISTING_HTTP_RULE=$(gcloud compute forwarding-rules list --global --filter="name:$HTTP_FORWARDING_RULE_NAME" --format="value(name)" --project=$PROJECT_ID 2>/dev/null || echo "")

if [ -z "$EXISTING_HTTP_RULE" ]; then
    # 一時的なYAMLファイルを作成
    cat > /tmp/redirect-map.yaml <<EOF
name: ${URL_MAP_NAME}-redirect
defaultUrlRedirect:
  httpsRedirect: true
  redirectResponseCode: MOVED_PERMANENTLY_DEFAULT
EOF
    
    # HTTP to HTTPS リダイレクト用のURL マップ
    gcloud compute url-maps import ${URL_MAP_NAME}-redirect \
        --source=/tmp/redirect-map.yaml \
        --global \
        --project=$PROJECT_ID
    
    # HTTPプロキシの作成
    gcloud compute target-http-proxies create ${SERVICE_NAME}-http-proxy \
        --url-map=${URL_MAP_NAME}-redirect \
        --global \
        --project=$PROJECT_ID
    
    # HTTP転送ルールの作成
    gcloud compute forwarding-rules create $HTTP_FORWARDING_RULE_NAME \
        --address=$IP_NAME \
        --global \
        --target-http-proxy=${SERVICE_NAME}-http-proxy \
        --ports=80 \
        --project=$PROJECT_ID
    
    # 一時ファイルを削除
    rm -f /tmp/redirect-map.yaml
    
    log_success "HTTP to HTTPS リダイレクトを設定しました"
else
    log_info "HTTP転送ルールは既に存在します: $HTTP_FORWARDING_RULE_NAME"
fi

# セットアップ完了
echo ""
echo "🎉 Tech-Master カスタムドメイン & CDN セットアップが完了しました！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 カスタムドメイン: https://$CUSTOM_DOMAIN"
echo "📍 静的IPアドレス: $STATIC_IP"
echo "🔒 SSL証明書: $CERT_NAME"
echo "🚀 Cloud Runサービス: $SERVICE_NAME"
echo ""
echo "⏰ 重要事項:"
echo "   1. SSL証明書の発行には最大24時間かかる場合があります"
echo "   2. DNS の伝播には最大48時間かかる場合があります"
echo "   3. 設定完了後、https://$CUSTOM_DOMAIN でアクセスできます"
echo ""
echo "🔍 状態確認コマンド:"
echo "   SSL証明書の状態: gcloud compute ssl-certificates describe $CERT_NAME --global --project=$PROJECT_ID"
echo "   DNS の確認: nslookup $CUSTOM_DOMAIN"
echo "   Cloud Run確認: gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID"
echo ""
echo "⚠️  Firebase Authentication の設定更新も必要です:"
echo "   Firebase Consoleで '$CUSTOM_DOMAIN' を承認済みドメインに追加してください"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

log_success "Tech-Master ドメインセットアップスクリプトが完了しました！"