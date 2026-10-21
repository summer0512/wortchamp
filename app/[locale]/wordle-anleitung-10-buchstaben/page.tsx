import { makeGuideMetadata, makeGuidePage } from "@/app/[locale]/guide-length-page-helpers";

export const generateMetadata = makeGuideMetadata({ wordLength: 10 });

const GuidePage = makeGuidePage({ wordLength: 10 });

export default GuidePage;
