import { useEffect } from "react";
import { useMatches } from "react-router";

const PageTitle = () => {
  const matches = useMatches();

  // Define page titles based on routes
  useEffect(() => {
    const mostSpecificTitle = matches
      .reverse()
      // @ts-expect-error TODO: figure out how to override handle type
      .map((match) => match.handle?.title)
      .filter((title) => title)[0];

    const pageTitle = mostSpecificTitle
      ? `${mostSpecificTitle} | Legal Matters`
      : "Legal Matters";
    // Update document title
    document.title = pageTitle;
  }, [matches]);

  // This component doesn't render anything
  return null;
};

export default PageTitle;
