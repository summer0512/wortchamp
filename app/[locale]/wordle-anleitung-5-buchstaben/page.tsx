import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 5 });

const GuidePage = makeGuidePage({ wordLength: 5 });

export default GuidePage;
