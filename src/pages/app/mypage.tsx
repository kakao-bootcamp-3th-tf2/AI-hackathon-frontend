import Header from "@/components/widgets/Header";

export default function MyPage() {
  return (
    <div className="gradient-hero min-h-screen">
      <Header />
      <main className="container px-4 py-8">
        <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card backdrop-blur">
          <h1 className="text-2xl font-bold text-foreground">마이페이지</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            연결된 카드와 알림 설정, 내 일정 등 개인 정보를 한곳에서 관리할 수 있습니다. 곧 더 많은 항목을 보여드릴게요.
          </p>
          <div className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/90">
            준비 중입니다
          </div>
        </section>
      </main>
    </div>
  );
}
