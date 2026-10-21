import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 11 });

const GuidePage = makeGuidePage({ wordLength: 11 });

export default GuidePage;
