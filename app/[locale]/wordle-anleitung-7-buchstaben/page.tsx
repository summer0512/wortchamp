import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 7 });

const GuidePage = makeGuidePage({ wordLength: 7 });

export default GuidePage;
