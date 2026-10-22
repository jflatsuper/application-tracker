import "./pagination.scss";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

type PageItem = number | "gap";

function pageItems(current: number, totalPages: number): PageItem[] {
  const pages = [
    ...new Set(
      [1, current - 1, current, current + 1, totalPages].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    ),
  ].sort((a, b) => a - b);

  const items: PageItem[] = [];
  let previous = 0;
  for (const p of pages) {
    if (p - previous === 2) items.push(previous + 1);
    else if (p - previous > 2) items.push("gap");
    items.push(p);
    previous = p;
  }
  return items;
}

const Pagination = ({ page, pageSize, total, onPageChange }: Props) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="pagination">
      <span>
        Showing {first}–{last} of {total}
      </span>
      {totalPages > 1 && (
        <nav className="pagination__nav" aria-label="Pagination">
          {page > 1 && (
            <button
              type="button"
              className="pagination__btn"
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </button>
          )}
          {pageItems(page, totalPages).map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                className="pagination__gap"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className="pagination__btn"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </button>
            ),
          )}
          {page < totalPages && (
            <button
              type="button"
              className="pagination__btn"
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </button>
          )}
        </nav>
      )}
    </div>
  );
};

export default Pagination;
