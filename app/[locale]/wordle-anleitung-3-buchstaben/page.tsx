import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 3 });

const GuidePage = makeGuidePage({ wordLength: 3 });

export default GuidePage;
