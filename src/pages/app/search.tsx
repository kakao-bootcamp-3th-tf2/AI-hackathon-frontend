import Header from "@/components/widgets/Header";

export default function SearchPage() {
  return (
    <div className="gradient-hero min-h-screen">
      <Header />
      <main className="container px-4 py-8">
        <section className="rounded-3xl border border-border/60 bg-white/80 p-6 shadow-card backdrop-blur">
          <h1 className="text-2xl font-bold text-foreground">오늘의 혜택 검색</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            원하는 키워드나 카테고리로 혜택을 빠르게 찾아보세요. 검색 기능은 곧 더 정교한 필터와 추천으로 확장됩니다.
          </p>
          <div className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/90">
            잠시만 기다려 주세요
          </div>
        </section>
      </main>
    </div>
  );
}
