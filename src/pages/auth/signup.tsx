import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6 rounded-3xl border border-border/50 bg-card p-8 shadow-card text-center">
        <h1 className="text-3xl font-bold">회원가입 안내</h1>
        <p className="text-base text-muted-foreground">
          조조 할인은 개인 맞춤 혜택을 제공하기 위해 카드, 구독 정보를 연결하고 행동을
          추적합니다. 안전하게 가입하고 아주 빠르게 혜택을 확인해보세요.
        </p>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>1. 이메일과 비밀번호로 간단하게 가입하세요.</p>
          <p>2. 카드와 구독을 등록하면 자동으로 혜택을 매칭해드립니다.</p>
          <p>3. 로그인 후 캘린더 입력, 혜택 보기, 알림 받기를 모두 이용할 수 있어요.</p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-full border border-primary/70 bg-primary/10 px-6 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary/20"
        >
          로그인 하러 가기
        </Link>
      </div>
    </div>
  );
}
