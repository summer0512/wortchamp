import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 6 });

const GuidePage = makeGuidePage({ wordLength: 6 });

export default GuidePage;
