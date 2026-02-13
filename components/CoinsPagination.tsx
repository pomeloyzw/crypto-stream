"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { buildPageNumbers, cn, ELLIPSIS } from "@/lib/utils";
import { useRouter } from "next/navigation";


const CoinsPagination = ({ currentPage, totalPages, hasMorePages }: Pagination) => {

  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/coins?page=${page}`);
  }

  const pageNumbers = buildPageNumbers(currentPage, totalPages);
  const isLastPage = !hasMorePages || currentPage >= totalPages;

  return (
    <Pagination id="coins-pagination" className="justify-center mt-4">
      <PaginationContent className="pagination-content">
        <PaginationItem className="pagination-control prev">
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage === 1}
            onClick={(e) => {
              if (currentPage === 1) e.preventDefault();
              else {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }
            }}
            className={currentPage === 1 ? "control-disabled" : "control-button"}
          />
        </PaginationItem>
        
        <div className="pagination-pages">
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === ELLIPSIS ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={`#page-${page}`}
                  aria-disabled={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                  className={cn("page-link", {
                    "page-link-active": currentPage === page
                  })}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>
  
        <PaginationItem className="pagination-control next">
          <PaginationNext
            href="#"
            aria-disabled={isLastPage}
            onClick={(e) => {
              if (isLastPage) e.preventDefault();
              else {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }
            }}
            className={isLastPage ? "control-disabled" : "control-button"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default CoinsPagination