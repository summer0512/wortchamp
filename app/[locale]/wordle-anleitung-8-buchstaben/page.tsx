import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 8 });

const GuidePage = makeGuidePage({ wordLength: 8 });

export default GuidePage;
