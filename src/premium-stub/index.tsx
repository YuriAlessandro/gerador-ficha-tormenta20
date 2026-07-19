/* eslint-disable */
// Stub público — gerado por scripts/generate-premium-stub.mjs.
import { NullComponent, PassthroughProvider, inertService } from './_inert';
import { DEFAULT_FEATURE_FLAGS } from '@/types/featureFlags.types';

// Sem o módulo premium não há como verificar assinatura, então toda
// feature paga fica desligada — useFeatureAccess (público) já esconde a
// UI correspondente a partir daqui.
const ALL_FEATURES_DISABLED = Object.fromEntries(
  Object.keys(DEFAULT_FEATURE_FLAGS).map((k) => [
    k,
    { enabled: false, supporterOnly: true },
  ])
) as unknown as typeof DEFAULT_FEATURE_FLAGS;

export const AdminPage = NullComponent;
export const BestiaryListPage = NullComponent;
export const BestiaryViewPage = NullComponent;
export const BlogEditor = NullComponent;
export const BlogList = NullComponent;
export const BlogPost = NullComponent;
export const BlogPostPage = NullComponent;
export const BlogService = inertService();
export const BuildViewPage = NullComponent;
export const BuildsListPage = NullComponent;
export const BuildsProvider = PassthroughProvider;
export const CarouselConfig = NullComponent;
export const CarouselConfigService = inertService();
export const ClassHomebrewEditorPage = NullComponent;
export const CollectionEditorPage = NullComponent;
export const CosmeticsNudgeDialog = NullComponent;
export const CreateThreadPage = NullComponent;
export const DeityHomebrewEditorPage = NullComponent;
export const DiceRollProvider = PassthroughProvider;
export const EditThreadPage = NullComponent;
export const ForumPage = NullComponent;
export const ForumProvider = PassthroughProvider;
export const GameSessionPage = NullComponent;
export const GameTableDetailPage = NullComponent;
export const GameTableProvider = PassthroughProvider;
export const GameTablesPage = NullComponent;
export const HomebrewActivationPanel = NullComponent;
export const HomebrewEditEntryPage = NullComponent;
export const HomebrewProvider = PassthroughProvider;
export const HomebrewTestSheetPage = NullComponent;
export const HomebrewViewPage = NullComponent;
export const HomebrewsListPage = NullComponent;
export const JoinTableByLinkPage = NullComponent;
export const MapaDeArtonPage = NullComponent;
export const MyBestiaryPage = NullComponent;
export const MyBuildsPage = NullComponent;
export const MyHomebrewsPage = NullComponent;
export const OriginHomebrewEditorPage = NullComponent;
export const PartnersProvider = PassthroughProvider;
export const PowerPackEditorPage = NullComponent;
export const PublishBestiaryModal = NullComponent;
export const PushNotificationPrompt = NullComponent;
export const PushNotificationToggle = NullComponent;
export const RaceHomebrewEditorPage = NullComponent;
export const SpellPackEditorPage = NullComponent;
export const ThreadPage = NullComponent;
export const getFeatureFlags = async () => ALL_FEATURES_DISABLED;
export const useHomebrews = () => ({
  activated: [],
  myHomebrews: [],
  loading: false,
  error: null,
});
export type BestiaryPublicationData = any;
