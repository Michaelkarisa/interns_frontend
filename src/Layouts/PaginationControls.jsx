import { Button } from '@/components/ui/button';

export const PaginationControls = ({ links, from, to, total, onPageChange, text }) => {
  if (!links || links.length === 0) return null;

  const itemsPerPage = to && from ? to - from + 1 : 0;
  if (total <= itemsPerPage) return null;

  const decodeLinkLabel = (label) =>
    label
      .replace('&laquo;', '«')
      .replace('&raquo;', '»')
      .replace('Previous', '← Previous')
      .replace('Next', 'Next →');

  // Separate Previous / Next from page numbers
  const prevLink = links.find((link) => link.label.includes('Previous'));
  const nextLink = links.find((link) => link.label.includes('Next'));
  const pageLinks = links.filter(
    (link) => !link.label.includes('Previous') && !link.label.includes('Next')
  );

  // Build visible page buttons
  let visiblePages = [];
  if (pageLinks.length > 5) {
    visiblePages = [
      ...pageLinks.slice(0, 4),          // first 4 pages
      { label: '...', url: null },       // ellipsis
      pageLinks[pageLinks.length - 1],   // last page
    ];
  } else {
    visiblePages = pageLinks;
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Showing {from} to {to} of {total} {text}
      </div>
      <div className="flex space-x-2">
        {/* Previous button */}
        {prevLink?.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(prevLink.url)}
            className="text-xs"
            aria-label="Previous page"
          >
            {decodeLinkLabel(prevLink.label)}
          </Button>
        )}

        {/* Page numbers */}
        {visiblePages.map((link, index) =>
          link.url ? (
            <Button
              key={index}
              variant={link.active ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(link.url)}
              className="text-xs"
              aria-current={link.active ? 'page' : undefined}
            >
              {decodeLinkLabel(link.label)}
            </Button>
          ) : (
            <span
              key={index}
              className="px-2 py-1.5 text-xs text-gray-500"
              aria-hidden="true"
            >
              {decodeLinkLabel(link.label)}
            </span>
          )
        )}

        {/* Next button */}
        {nextLink?.url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(nextLink.url)}
            className="text-xs"
            aria-label="Next page"
          >
            {decodeLinkLabel(nextLink.label)}
          </Button>
        )}
      </div>
    </div>
  );
};
