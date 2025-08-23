export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-2xl-custom font-bold text-black mb-4">利用規約</h1>
        <p className="text-sm-custom font-normal text-black text-justify">
          この利用規約（以下「本規約」といいます）は、政治団体「チームみらい」（以下「当団体」といいます）が提供するウェブサービス「アクションボード」（以下「本サービス」といいます）の利用条件を定めるものです。本サービスのご利用にあたっては、本規約に同意いただく必要があります。同意いただけない場合は、本サービスをご利用いただけません。
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            1. サービスの目的と性質
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify">
            本サービスは、ユーザーが当団体の活動を支援することを目的として提供されるものであり、特定の活動をユーザーの任意で行うことに対し、ポイントを付与するなどのゲーミフィケーション要素を備えています。
          </p>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            2. 利用資格
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify mb-3">
            本サービスの利用は、以下の条件をすべて満たす方に限られます。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm-custom text-black mb-3">
            <li>満18歳以上であること</li>
            <li>本規約に同意し、遵守する意思を有すること</li>
            <li>法令および公序良俗に反しない行動を取ることができること</li>
          </ul>
          <p className="text-red-600 font-medium">
            18歳未満の方のご利用はできません。
          </p>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            3. ユーザー登録とアカウント管理
          </h2>
          <div className="space-y-3 text-sm-custom font-normal text-black text-justify">
            <p>
              本サービスを利用するには、当団体所定の方法による登録が必要です。登録情報は正確かつ最新のものでなければなりません。
            </p>
            <p>
              ユーザーは、自己の責任においてアカウントおよびパスワードを管理し、第三者に利用させてはなりません。
            </p>
            <p>
              当団体は、虚偽の登録など不正があると判断した場合、アカウントを停止・削除することができます。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            4. ポイントおよびランキング制度
          </h2>
          <div className="space-y-3 text-sm-custom font-normal text-black text-justify">
            <p>
              ユーザーは、当団体が定める方法により、所定の政治活動に協力することでポイントを取得できます。
            </p>
            <p>
              ポイントは地域ごとのランキング表示などに使用されますが、金銭的価値は一切なく、換金・譲渡・財産的利用はできません。
            </p>
            <p>
              当団体は、ポイント制度やランキング機能を予告なく変更または廃止することができます。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            5. 禁止事項
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify mb-3">
            ユーザーは、以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm-custom text-black">
            <li>法令または公序良俗に反する行為</li>
            <li>政治活動及び選挙運動に関して法令により禁止されている行為</li>
            <li>他人になりすます行為</li>
            <li>
              本サービスの全部または一部を改変・模倣し、誤認を招くような行為
            </li>
            <li>サーバへの過剰な負荷、システムへの妨害・改ざん・侵入行為</li>
            <li>自動化ツール、ボット等による操作</li>
            <li>他ユーザーの個人情報を無断で収集・利用する行為</li>
            <li>その他、当団体が不適切と判断する一切の行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            6. 知的財産権とオープンソースの取り扱い
          </h2>
          <div className="space-y-3 text-sm-custom font-normal text-black text-justify">
            <p>
              本サービスの名称、ロゴ、デザイン、ランキング情報等に関する権利は、当団体または正当な権利者に帰属します。
            </p>
            <p>
              本サービスの一部はオープンソースソフトウェア（OSS）として公開される場合があります。OSS部分はライセンスに従い利用可能ですが、当団体が公式に提供するサービスは、公式ドメイン（
              <a
                href="https://action.team-mir.ai/"
                className="text-black hover:text-black underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://action.team-mir.ai/
              </a>
              ）を通じてのみ提供されます。
            </p>
            <p>
              OSSコードを用いた非公式サービスにより生じた損害について、当団体は一切の責任を負いません。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            7. ミッション成果物の取り扱い
          </h2>
          <div className="space-y-3 text-sm-custom font-normal text-black text-justify">
            <p>
              ユーザーは、ミッション達成に関する成果物（写真、動画URL、SNS投稿リンク、位置情報等）を当団体に提出することがあります。
            </p>
            <p>
              成果物は内部記録・不正防止・ポイント認定の目的に限定して使用され、ユーザーの同意なく外部に公開されることはありません。
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            8. サービスの変更・中断・終了
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify">
            当団体は、ユーザーへの通知の有無にかかわらず、本サービスの内容を変更・中止・終了することがあります。これにより生じた損害について、当団体は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            9. 免責事項
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify">
            本サービスは現状有姿で提供され、当団体はその正確性・完全性・有用性を保証しません。システム障害、通信障害、データ損失、外部攻撃などによりユーザーに損害が生じた場合でも、当団体に故意または重過失がある場合を除き、責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            10. 規約の変更
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify">
            当団体は、ユーザーの承諾を得ることなく、本規約を変更することができます。変更後の規約は、本サービス上で掲示された時点で効力を生じます。重要な変更については、登録メールアドレス等を通じて通知する場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-lg-custom font-bold text-black mb-4 border-b-2 border-tm-teal pb-2">
            11. 準拠法および管轄裁判所
          </h2>
          <p className="text-sm-custom font-normal text-black text-justify">
            本規約は日本法に準拠し、本サービスに関して発生する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          最終更新日: {new Date().toLocaleDateString("ja-JP")}
        </p>
      </div>
    </div>
  );
}
