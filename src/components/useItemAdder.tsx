import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Check, X } from "lucide-react-native";
import { MotiView, AnimatePresence } from "./moti";
import { useCart } from "../context/CartContext";
import { formatAUD, priceLabel, type MenuItem } from "../data/menu";
import { useLayout } from "../hooks/useLayout";
import { Button, C, SafeImage, tap } from "./ui";

/**
 * Shared "add to cart" behaviour.
 * Simple dishes are added straight away; dishes with price tiers or pick-one options open a sheet first.
 * Render `sheet` once inside the screen.
 */
export function useItemAdder() {
  const { addLine } = useCart();
  const { insets } = useLayout();
  const [active, setActive] = useState<MenuItem | null>(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const add = useCallback(
    (item: MenuItem) => {
      tap();
      if (!item.variants?.length && !item.choices?.length) {
        addLine(item);
        showToast(`${item.name} added`);
        return;
      }
      setVariantIdx(0);
      const defaults: Record<string, string> = {};
      item.choices?.forEach((c) => {
        defaults[c.label] = c.options[0];
      });
      setPicked(defaults);
      setActive(item);
    },
    [addLine, showToast]
  );

  const confirm = () => {
    if (!active) return;
    const variant = active.variants?.[variantIdx];
    const parts = [
      ...(active.choices?.map((c) => picked[c.label]).filter(Boolean) ?? []),
      ...(variant ? [variant.label] : []),
    ];
    addLine(active, { detail: parts.join(" · "), unitPrice: variant ? variant.price : active.price });
    showToast(`${active.name} added`);
    setActive(null);
  };

  const sheet = (
    <>
      <Modal
        visible={!!active}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setActive(null)}
      >
        <Pressable style={{ flex: 1, backgroundColor: "rgba(10,25,17,0.6)" }} onPress={() => setActive(null)} />
        {active ? (
          <View style={{ backgroundColor: "rgba(10,25,17,0.6)" }}>
            <View
              style={{
                alignSelf: "center",
                width: "100%",
                maxWidth: 560,
                backgroundColor: C.paper,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                maxHeight: "86%",
                paddingBottom: Math.max(insets.bottom, 16),
              }}
            >
              <View className="flex-row items-center px-5 pb-3 pt-5">
                <SafeImage uri={active.image} style={{ width: 58, height: 58, borderRadius: 14 }} />
                <View className="ml-3 flex-1">
                  <Text className="text-lg font-extrabold text-ink" numberOfLines={2}>
                    {active.name}
                  </Text>
                  <Text className="text-sm font-bold text-ink/70">{priceLabel(active)}</Text>
                </View>
                <Pressable
                  onPress={() => setActive(null)}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  className="h-10 w-10 items-center justify-center rounded-full bg-ink/10"
                >
                  <X color={C.ink} size={18} />
                </Pressable>
              </View>

              <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                {active.choices?.map((c) => (
                  <View key={c.label} className="mb-4">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-[2px] text-ink/65">{c.label}</Text>
                    <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                      {c.options.map((o) => {
                        const on = picked[c.label] === o;
                        return (
                          <Pressable
                            key={o}
                            onPress={() => {
                              tap();
                              setPicked((p) => ({ ...p, [c.label]: o }));
                            }}
                            style={{
                              borderRadius: 999,
                              borderWidth: 1.5,
                              borderColor: C.ink,
                              backgroundColor: on ? C.forest : C.white,
                              paddingHorizontal: 16,
                              paddingVertical: 10,
                            }}
                          >
                            <Text style={{ color: on ? C.cream : C.ink, fontWeight: "700" }}>{o}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}

                {active.variants ? (
                  <View className="mb-2">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-[2px] text-ink/65">Choose option</Text>
                    {active.variants.map((v, i) => {
                      const on = variantIdx === i;
                      return (
                        <Pressable
                          key={v.label}
                          onPress={() => {
                            tap();
                            setVariantIdx(i);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderRadius: 16,
                            borderWidth: 1.5,
                            borderColor: on ? C.forest : C.line,
                            backgroundColor: on ? "rgba(29,60,44,0.07)" : C.white,
                            padding: 14,
                            marginBottom: 8,
                          }}
                        >
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              borderWidth: 2,
                              borderColor: C.forest,
                              backgroundColor: on ? C.forest : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            {on ? <Check color={C.cream} size={13} /> : null}
                          </View>
                          <Text className="flex-1 text-sm text-ink">{v.label}</Text>
                          <Text className="ml-2 text-sm font-extrabold text-ink">{formatAUD(v.price)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </ScrollView>

              <View className="px-5 pt-2">
                <Button
                  label={`Add to order${active.variants ? ` · ${formatAUD(active.variants[variantIdx].price)}` : ""}`}
                  onPress={confirm}
                />
              </View>
            </View>
          </View>
        ) : null}
      </Modal>

      <AnimatePresence>
        {toast ? (
          <MotiView
            key="toast"
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            style={{ position: "absolute", top: insets.top + 10, left: 20, right: 20, alignItems: "center", zIndex: 50 }}
            pointerEvents="none"
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: C.cream,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: C.forest,
                paddingHorizontal: 18,
                paddingVertical: 10,
                maxWidth: 520,
              }}
            >
              <Check color={C.forest} size={16} />
              <Text numberOfLines={1} style={{ color: C.ink, fontWeight: "800", marginLeft: 8, flexShrink: 1 }}>
                {toast}
              </Text>
            </View>
          </MotiView>
        ) : null}
      </AnimatePresence>
    </>
  );

  return { add, sheet };
}
