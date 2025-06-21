import { getUser } from "@/lib/services/users";
import Link from "next/link";
import Levels from "./levels";
import { Button } from "./ui/button";

export default async function Hero() {
  const user = await getUser();

  if (user) {
    try {
      return <Levels userId={user.id} clickable={true} />;
    } catch (error) {
      console.error("Error fetching user levels:", error);
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 overflow-hidden">
      {/* 背景グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-transparent to-teal-100/40" />

      {/* 放射状グラデーション */}
      <div className="absolute inset-0 bg-gradient-radial from-emerald-200/30 via-transparent to-transparent" />

      {/* パターン背景 */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-4 leading-tight">
            チームみらい
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
              アクションボード
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 font-medium">
            テクノロジーで政治をかえる。あなたと一緒に未来をつくる。
          </p>

          {!user && (
            <div className="flex flex-col items-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="min-w-72 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 text-white font-bold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="text-lg">🚀 チームみらいで手を動かす</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
