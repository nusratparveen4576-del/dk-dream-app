import React, { useEffect, useRef, useState } from "react";
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, MapPin, Phone, Plus, Sparkles } from "lucide-react-native";
import { MotiView } from "../../components/moti";
import { BRAND } from "../../data/brand";
import { MENU, priceLabel, type CategoryId, type MenuItem } from "../../data/menu";
import { useLayout } from "../../hooks/useLayout";
import { Button, C, Logo, SafeImage, SectionHeading, tap } from "../../components/ui";
import { useItemAdder } from "../../components/useItemAdder";

type ViewToken = { item: unknown; isViewable: boolean };

const byId = (id: string) => MENU.find((m) => m.id === id)!.image;

// Slide 1 is the restaurant's own photo, shown uncropped ("contain") over a blurred copy of itself.
const SLIDES: { uri: string; contain?: boolean }[] = [
  { uri: BRAND.heroFirst, contain: true },
  { uri: byId("pad-thai") },
  { uri: byId("carbonara") },
  { uri: byId("matcha-series") },
];

const IDENTITY: { id: CategoryId; title: string; sub: string; image: string; badge?: string }[] = [
  { id: "thai", title: "Authentic Thai", sub: "Curries & wok classics", image: byId("pad-kee-mao") },
  { id: "italian", title: "Italian Pastas", sub: "Creamy & slow-simmered", image: byId("carbonara") },
  { id: "pub", title: "Pub Classics", sub: "Schnitzels & loaded fries", image: byId("chicken-schnitzel") },
  { id: "drinks", title: "Matcha & Ube", sub: "The 2026 drinks series", image: byId("matcha-series"), badge: "NEW" },
];

/** Centres content, applies gutters and horizontal safe-area insets. */
function Inner({ children, max = 1100 }: { children: React.ReactNode; max?: number }) {
  const { insets, gutter } = useLayout();
  return (
    <View style={{ paddingLeft: insets.left + gutter, paddingRight: insets.right + gutter }}>
      <View style={{ width: "100%", maxWidth: max, alignSelf: "center" }}>{children}</View>
    </View>
  );
}

function HeroSlideshow() {
  const { isTablet, isWide } = useLayout();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <View>
      <View
        style={{
          width: "100%",
          aspectRatio: isWide ? 1.45 : isTablet ? 1.6 : 1.12,
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: C.forestDeep,
        }}
      >
        {SLIDES.map((s, i) => (
          <MotiView
            key={s.uri}
            animate={{ opacity: active === i ? 1 : 0 }}
            transition={{ type: "timing", duration: 900 }}
            style={StyleSheet.absoluteFill}
          >
            {s.contain ? (
              <>
                <Image
                  source={{ uri: s.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                  blurRadius={30}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(22,48,31,0.35)" }]} />
                <Image
                  source={{ uri: s.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="contain"
                  accessibilityLabel="DK Dream Kitchen"
                />
              </>
            ) : (
              <SafeImage uri={s.uri} style={StyleSheet.absoluteFill} />
            )}
          </MotiView>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 }}>
        {SLIDES.map((s, i) => (
          <MotiView
            key={s.uri}
            animate={{ width: active === i ? 26 : 8, opacity: active === i ? 1 : 0.4 }}
            style={{ height: 6, borderRadius: 3, backgroundColor: C.cream }}
          />
        ))}
      </View>
    </View>
  );
}

function GreenBlock() {
  const { insets, isTablet, isWide, fs } = useLayout();
  return (
    <View style={{ backgroundColor: C.forest, paddingTop: insets.top + 12, paddingBottom: 34 }}>
      <Inner>
        {/* Brand row, like the client's website header */}
        <View className="flex-row items-center">
          <Logo size={isTablet ? 60 : 50} />
          <View className="ml-3 flex-1">
            <Text
              className="font-extrabold uppercase text-white"
              style={{ fontSize: fs(19, 26), letterSpacing: 0.8 }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              DK Dream Kitchen
            </Text>
            <Text className="mt-0.5 uppercase text-cream/80" style={{ fontSize: 11.5, letterSpacing: 2.2 }}>
              Restaurant · Young NSW
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 22,
            flexDirection: isWide ? "row-reverse" : "column",
            alignItems: isWide ? "center" : "stretch",
            gap: isWide ? 40 : 0,
          }}
        >
          <View style={{ flex: isWide ? 1.15 : undefined }}>
            <HeroSlideshow />
          </View>
          <View style={{ flex: isWide ? 1 : undefined }}>
            <MotiView
              from={{ opacity: 0, translateY: 24 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring", delay: 250 }}
            >
              <Text
                className="font-extrabold uppercase text-white"
                style={{
                  marginTop: isWide ? 0 : 26,
                  fontSize: isWide ? 54 : fs(34, 46),
                  lineHeight: isWide ? 60 : fs(40, 52),
                  letterSpacing: 0.3,
                }}
              >
                One Kitchen. Endless Cravings.
              </Text>
              <Text
                className="text-cream/85"
                style={{ marginTop: 16, fontSize: fs(17, 20), lineHeight: fs(27, 31) }}
              >
                Authentic Thai flavours, Western comfort food and our exciting Matcha &amp; Ube drink series.
              </Text>
              <View className="mt-6 flex-row flex-wrap" style={{ gap: 12 }}>
                <Button label="Explore Our Menu" variant="cream" onPress={() => router.navigate("/menu")} />
                <Button label="Order Now" variant="outlineOnGreen" onPress={() => router.navigate("/cart")} />
              </View>
            </MotiView>
          </View>
        </View>
      </Inner>
    </View>
  );
}

function IdentityGrid() {
  const { wideWidth, insets, gutter, isWide } = useLayout();
  const cols = isWide ? 4 : 2;
  const gap = 14;
  const inner = Math.min(wideWidth - gutter * 2, 1100);
  const cardW = Math.floor((inner - gap * (cols - 1)) / cols);
  void insets;
  return (
    <Inner>
      <View className="flex-row flex-wrap" style={{ gap }}>
        {IDENTITY.map((c, i) => (
          <MotiView
            key={c.id}
            from={{ opacity: 0, translateY: 40, scale: 0.94 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: "spring", delay: 150 + i * 110, damping: 14 }}
            style={{ width: cardW }}
          >
            <Pressable
              onPress={() => {
                tap();
                router.navigate({ pathname: "/menu", params: { cat: c.id } });
              }}
              accessibilityRole="button"
              accessibilityLabel={c.title}
              className="active:opacity-85"
              style={{ height: cardW * 1.1, borderRadius: 24, overflow: "hidden", backgroundColor: C.forest }}
            >
              <SafeImage uri={c.image} style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={["rgba(22,48,31,0)", "rgba(22,48,31,0.92)"]}
                locations={[0.35, 1]}
                style={StyleSheet.absoluteFill}
              />
              {c.badge ? (
                <View className="absolute right-3 top-3 flex-row items-center rounded-full bg-cream px-2.5 py-1">
                  <Sparkles color={C.ink} size={11} />
                  <Text className="ml-1 text-[10px] font-extrabold text-ink">{c.badge}</Text>
                </View>
              ) : null}
              <View className="absolute bottom-3 left-3.5 right-3.5">
                <Text className="text-base font-extrabold uppercase text-white" numberOfLines={1}>
                  {c.title}
                </Text>
                <Text className="text-xs text-cream/80" numberOfLines={1}>
                  {c.sub}
                </Text>
              </View>
            </Pressable>
          </MotiView>
        ))}
      </View>
    </Inner>
  );
}

function PromoCard({ item, seen, onAdd }: { item: MenuItem; seen: boolean; onAdd: (i: MenuItem) => void }) {
  return (
    <MotiView
      animate={{ opacity: seen ? 1 : 0, translateY: seen ? 0 : 50, scale: seen ? 1 : 0.96 }}
      transition={{ type: "spring", damping: 14, stiffness: 110 }}
      style={{ flex: 1, padding: 8 }}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: C.white,
          borderWidth: 1,
          borderColor: C.line,
        }}
      >
        <View>
          <SafeImage uri={item.image} style={{ width: "100%", aspectRatio: 1.7 }} />
          <View className="absolute left-3 top-3 rounded-full bg-forest px-3 py-1">
            <Text className="text-[11px] font-extrabold uppercase text-cream">Best seller</Text>
          </View>
        </View>
        <View className="flex-row items-center p-4">
          <View className="flex-1 pr-3">
            <Text className="text-base font-extrabold text-ink" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="mt-1 text-sm font-bold text-ink/70">{priceLabel(item)}</Text>
          </View>
          <Pressable
            onPress={() => onAdd(item)}
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name}`}
            className="h-12 w-12 items-center justify-center rounded-full bg-forest active:opacity-80"
          >
            <Plus color={C.cream} size={24} />
          </Pressable>
        </View>
      </View>
    </MotiView>
  );
}

function InfoFooter() {
  const { fabSpace } = useLayout();
  return (
    <View style={{ paddingTop: 34, paddingBottom: fabSpace + 20 }}>
      <Inner max={760}>
        <View style={{ backgroundColor: C.forest, borderRadius: 28, padding: 22 }}>
          <Text className="text-lg font-extrabold uppercase text-white">Visit us</Text>
          <View className="mt-4 flex-row items-center">
            <Clock color={C.cream} size={20} />
            <Text className="ml-3 flex-1 text-base text-cream">Daily {BRAND.hours[0].time}</Text>
          </View>
          <View className="mt-3 flex-row items-center">
            <MapPin color={C.cream} size={20} />
            <Text className="ml-3 flex-1 text-base text-cream">{BRAND.address}</Text>
          </View>
          <View className="mt-5 flex-row flex-wrap" style={{ gap: 10 }}>
            <Button
              label={`Call ${BRAND.phone}`}
              variant="cream"
              icon={(c) => <Phone color={c} size={18} />}
              onPress={() => Linking.openURL(BRAND.phoneLink).catch(() => {})}
            />
            <Button label="Book a Table" variant="outlineOnGreen" onPress={() => router.navigate("/reserve")} />
          </View>
        </View>
      </Inner>
    </View>
  );
}

export default function HomeScreen() {
  const { isTablet } = useLayout();
  const { add, sheet } = useItemAdder();
  const [seen, setSeen] = useState<Record<string, boolean>>({});
  const popular = MENU.filter((m) => m.popular);
  const cols = isTablet ? 2 : 1;

  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    setSeen((prev) => {
      const next = { ...prev };
      viewableItems.forEach((v) => {
        if (v.isViewable && v.item) next[(v.item as MenuItem).id] = true;
      });
      return next;
    });
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <FlatList
        key={`best-${cols}`}
        data={popular}
        numColumns={cols}
        keyExtractor={(i) => i.id}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 10 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        ListHeaderComponent={
          <View>
            <GreenBlock />
            <SectionHeading title="Your favourites, all in one place" size={isTablet ? 28 : 22} />
            <IdentityGrid />
            <SectionHeading eyebrow="Guest favourites" title="Best Sellers" size={isTablet ? 28 : 22} />
          </View>
        }
        renderItem={({ item, index }) => (
          <PromoCard item={item} seen={!!seen[item.id] || index < 2} onAdd={add} />
        )}
        contentContainerStyle={{ alignSelf: "stretch" }}
        columnWrapperStyle={undefined}
        ListFooterComponent={<InfoFooter />}
      />
      {sheet}
    </View>
  );
}
