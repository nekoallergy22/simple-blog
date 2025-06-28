import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お問い合わせ・サポート',
  description: 'Tech-Masterのお問い合わせ、よくある質問、プライバシーポリシー、利用規約について',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          お問い合わせ・サポート
        </h1>
        <p className="text-lg text-gray-600">
          Tech-Masterに関するお問い合わせや各種ポリシーについて
        </p>
      </div>

      {/* お問い合わせ */}
      <section id="contact" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">お問い合わせ</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Tech-Masterのサービスに関するご質問、ご要望、技術的なお問い合わせがございましたら、
            下記のメールアドレスまでお気軽にご連絡ください。
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">メールアドレス:</p>
            <p className="text-lg font-medium text-blue-600">
              <a href="mailto:contact@tech-master.com" className="hover:underline">
                contact@tech-master.com
              </a>
            </p>
          </div>
          <p className="text-sm text-gray-500">
            ※ お返事まで2-3営業日程度お時間をいただく場合がございます。
          </p>
        </div>
      </section>

      {/* よくある質問 */}
      <section id="faq" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">よくある質問</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Q. Tech-Masterは無料で利用できますか？
            </h3>
            <p className="text-gray-600">
              A. はい、Tech-Masterのすべてのコンテンツは無料でご利用いただけます。
              会員登録も不要で、どなたでも自由に学習していただけます。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Q. 新しい記事はどのくらいの頻度で追加されますか？
            </h3>
            <p className="text-gray-600">
              A. 現在は不定期での更新となっておりますが、各セクションのコンテンツを順次充実させていく予定です。
              更新情報については、サイトをご確認ください。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Q. 記事の内容について質問がある場合はどうすればよいですか？
            </h3>
            <p className="text-gray-600">
              A. 記事の内容に関するご質問は、上記のお問い合わせメールアドレスまでご連絡ください。
              できる限り丁寧にお答えいたします。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Q. スマートフォンでも利用できますか？
            </h3>
            <p className="text-gray-600">
              A. はい、Tech-Masterはレスポンシブデザインを採用しており、
              スマートフォンやタブレットでも快適にご利用いただけます。
            </p>
          </div>
        </div>
      </section>

      {/* プライバシーポリシー */}
      <section id="privacy" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">プライバシーポリシー</h2>
        <div className="space-y-4 text-gray-600">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">個人情報の収集について</h3>
            <p>
              Tech-Masterでは、サービスの改善のため、Googleアナリティクスなどの分析ツールを使用する場合があります。
              これらのツールは匿名化された統計データのみを収集し、個人を特定する情報は収集いたしません。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookieの使用について</h3>
            <p>
              本サイトでは、ユーザー体験の向上のためCookieを使用する場合があります。
              Cookieを無効にしてもサイトの基本機能はご利用いただけますが、
              一部の機能が制限される可能性があります。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">第三者への情報提供について</h3>
            <p>
              収集した情報を第三者に販売、貸与、提供することはありません。
              法的な要請がある場合を除き、ユーザーの同意なく第三者に情報を開示することはありません。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">プライバシーポリシーの変更</h3>
            <p>
              本プライバシーポリシーは、必要に応じて改定される場合があります。
              変更がある場合は、本ページにて告知いたします。
            </p>
          </div>
        </div>
      </section>

      {/* 利用規約 */}
      <section id="terms" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">利用規約</h2>
        <div className="space-y-4 text-gray-600">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">サービスの利用について</h3>
            <p>
              Tech-Masterのコンテンツは教育目的での利用を前提としています。
              学習以外の目的での過度なアクセスや、サーバーに負荷をかける行為はお控えください。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">著作権について</h3>
            <p>
              Tech-Masterに掲載されているすべてのコンテンツ（文章、画像、コードサンプル等）の著作権は、
              Tech-Masterまたは各権利者に帰属します。個人的な学習目的での使用は許可しますが、
              商用利用や再配布は事前にお問い合わせください。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">免責事項</h3>
            <p>
              Tech-Masterのコンテンツは正確性を心がけて作成していますが、
              内容の正確性や完全性を保証するものではありません。
              本サイトの情報を利用して生じたいかなる損害についても、責任を負いかねます。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">サービスの変更・終了</h3>
            <p>
              Tech-Masterは、予告なくサービスの内容を変更したり、
              サービスの提供を終了したりする場合があります。
              これによって生じる損害について、責任を負いかねます。
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">利用規約の変更</h3>
            <p>
              本利用規約は、必要に応じて改定される場合があります。
              変更がある場合は、本ページにて告知いたします。
              変更後も継続してサービスをご利用いただいた場合、
              変更後の利用規約に同意したものとみなします。
            </p>
          </div>
        </div>
      </section>

      <div className="text-center text-sm text-gray-500">
        最終更新日: 2024年6月28日
      </div>
    </div>
  );
}