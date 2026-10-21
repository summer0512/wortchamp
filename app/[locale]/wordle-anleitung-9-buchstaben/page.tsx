import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 9 });

const GuidePage = makeGuidePage({ wordLength: 9 });

export default GuidePage;
