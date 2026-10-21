import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 4 });

const GuidePage = makeGuidePage({ wordLength: 4 });

export default GuidePage;
