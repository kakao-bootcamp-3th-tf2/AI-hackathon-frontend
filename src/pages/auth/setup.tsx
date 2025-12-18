import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useStore } from "@/store/useStore";
import { CreditCard, Smartphone, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/entities/card/types";
import { SelectionModal } from "@/components/features/setup/SelectionModal";
import { useJoinMember, useAuthStatus } from "@/entities/auth";
import {
  cardSelectionOptions,
  paySelectionOptions,
  planSelectionOptions,
  Pay,
  Plan
} from "@/lib/mockData";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "@/entities/auth/api/authQueryKeys";

export default function SetupPage() {
  const router = useRouter();
  const { data: authStatus } = useAuthStatus();
  const {
    cards,
    addCard,
    removeCard,
    pays,
    addPay,
    removePay,
    plans,
    addPlan,
    removePlan
  } = useStore();
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [hoveredPayId, setHoveredPayId] = useState<string | null>(null);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  // Modal states
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // Load memberId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("memberId");
      setMemberId(id);
    }
  }, []);

  const queryClient = useQueryClient();

  // Join member mutation
  const joinMutation = useJoinMember({
    onSuccess: () => {
      console.log("✓ 온보딩 완료! /app으로 리다이렉트합니다");
      // 성공 후 /app으로 리다이렉트
      queryClient.invalidateQueries({
        queryKey: authQueryKeys.status.list()
      });
      router.push("/app");
    },
    onError: (error) => {
      console.error("✗ 온보딩 실패:", error);
      toast.error("온보딩 설정 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  });

  const handleAddCard = () => {
    setCardModalOpen(true);
  };

  const handleSelectCards = (selectedCards: Card[]) => {
    addCard(selectedCards);
    setCardModalOpen(false);
  };

  const handleAddPay = () => {
    setPayModalOpen(true);
  };

  const handleSelectPays = (selectedPays: Pay[]) => {
    addPay(selectedPays);
    setPayModalOpen(false);
  };

  const handleAddPlan = () => {
    setPlanModalOpen(true);
  };

  const handleSelectPlans = (selectedPlans: Plan[]) => {
    addPlan(selectedPlans);
    setPlanModalOpen(false);
  };

  const handleCompleteSetup = async () => {
    // 유효성 검증
    // if (!authStatus?.id) {
    //   toast.error("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
    //   return;
    // }

    if (cards.length === 0) {
      toast.error("최소 하나 이상의 카드를 선택해주세요.");
      return;
    }

    if (plans.length === 0) {
      toast.error("최소 하나 이상의 요금제를 선택해주세요.");
      return;
    }

    // 선택한 요금제 (첫 번째만 사용)
    const selectedTelecom = plans[0].id;

    // 카드와 페이 id를 payments 배열로 변환
    const paymentIds = [
      ...cards.map((card) => card.id),
      ...pays.map((pay) => pay.id)
    ];

    const setupData = {
      memberId: parseInt(memberId || "0"),
      telecom: selectedTelecom,
      payments: paymentIds
    };

    try {
      await joinMutation.mutateAsync(setupData);
    } catch (error) {
      console.error("온보딩 중 오류 발생:", error);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    removeCard(cardId);
    setHoveredCardId(null);
  };

  const handleDeletePay = (payId: string) => {
    removePay(payId);
    setHoveredPayId(null);
  };

  const handleDeletePlan = (planId: string) => {
    removePlan(planId);
    setHoveredPlanId(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">내 정보 설정</h1>
        <p className="text-muted-foreground">등록된 카드로 맞춤 혜택을 받아보세요</p>
      </div>

      <div className="space-y-6">
        {/* Cards Section */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">내 카드</h2>
                <p className="text-sm text-muted-foreground">
                  현재 등록되어 있는 카드들입니다
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddCard}
              className="gap-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">등록된 카드가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="relative rounded-xl border border-border/50 p-4 transition-all hover:shadow-card hover:border-primary/30 group"
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <h4 className="font-semibold text-foreground">{card.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {card.issuer} • {card.currency}
                  </p>

                  {/* Delete Button - appears on hover */}
                  {hoveredCardId === card.id && (
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      title="카드 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pay Section */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">페이</h2>
                <p className="text-sm text-muted-foreground">
                  카카오페이, 토스 페이, 네이버 페이 등을 등록하세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPay}
              className="gap-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>

          {pays.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">등록된 페이가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {pays.map((pay) => (
                <div
                  key={pay.id}
                  className="relative rounded-xl border border-border/50 p-4 transition-all hover:shadow-card hover:border-primary/30 group"
                  onMouseEnter={() => setHoveredPayId(pay.id)}
                  onMouseLeave={() => setHoveredPayId(null)}
                >
                  <h4 className="font-semibold text-foreground">{pay.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{pay.provider}</p>

                  {/* Delete Button - appears on hover */}
                  {hoveredPayId === pay.id && (
                    <button
                      onClick={() => handleDeletePay(pay.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      title="페이 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Section */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">내 요금제</h2>
                <p className="text-sm text-muted-foreground">
                  LG U+, SKT, KT 등을 등록하세요
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddPlan}
              className="gap-2 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              추가
            </Button>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">등록된 요금제가 없습니다</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative rounded-xl border border-border/50 p-4 transition-all hover:shadow-card hover:border-primary/30 group"
                  onMouseEnter={() => setHoveredPlanId(plan.id)}
                  onMouseLeave={() => setHoveredPlanId(null)}
                >
                  <h4 className="font-semibold text-foreground">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{plan.provider}</p>

                  {/* Delete Button - appears on hover */}
                  {hoveredPlanId === plan.id && (
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                      title="요금제 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complete Button */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <Button
            onClick={handleCompleteSetup}
            disabled={joinMutation.isPending}
            className="w-full h-12 rounded-lg text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {joinMutation.isPending ? "설정 중..." : "설정 완료하기"}
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SelectionModal<Card>
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onSelect={handleSelectCards}
        title="카드 선택"
        options={cardSelectionOptions}
        displayKey="name"
        subtitleKey="issuer"
        initialSelectedIds={cards.map((card) => card.id)}
        mode="multi"
      />

      <SelectionModal<Pay>
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onSelect={handleSelectPays}
        title="페이 선택"
        options={paySelectionOptions}
        displayKey="name"
        subtitleKey="provider"
        initialSelectedIds={pays.map((pay) => pay.id)}
        mode="multi"
      />

      <SelectionModal<Plan>
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        onSelect={handleSelectPlans}
        title="요금제 선택"
        options={planSelectionOptions}
        displayKey="name"
        subtitleKey="provider"
        initialSelectedIds={plans.map((plan) => plan.id)}
        mode="single"
      />
    </div>
  );
}
