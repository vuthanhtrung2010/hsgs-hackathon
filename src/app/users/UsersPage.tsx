"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { IUsersListData } from "@/lib/server-actions/users";
import { getRatingTitle } from "@/lib/rating";
import RatingDisplay from "@/components/RatingDisplay";
import "@/styles/rating.css";
import "@/styles/table.css";
import Loading from "../loading";
import NameDisplay from "@/components/NameDisplay";

const USERS_PER_PAGE = 50;

type SortField = "name" | "rating";
type SortOrder = "asc" | "desc" | null;

interface UsersPageProps {
  initialUsers: IUsersListData[];
}

export default function UsersPage({ initialUsers }: UsersPageProps) {
  const [filteredUsers, setFilteredUsers] = useState<IUsersListData[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return faSort;
    if (sortOrder === "asc") return faSortUp;
    if (sortOrder === "desc") return faSortDown;
    return faSort;
  };

  const sortUsers = useCallback(
    (users: IUsersListData[]) => {
      if (!sortField || !sortOrder) return users;

      return [...users].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortField) {
          case "name":
            aValue = a.id;
            bValue = b.id;
            break;
          case "rating":
            aValue = a.rating;
            bValue = b.rating;
            break;
          default:
            return 0;
        }

        const comparison = aValue - bValue;
        return sortOrder === "asc" ? comparison : -comparison;
      });
    },
    [sortField, sortOrder]
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = initialUsers;

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.name.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = sortUsers(filtered);

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, initialUsers, sortField, sortOrder, sortUsers]);

  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      {!isLoaded && <Loading />}
      <div className={`users-page-container ${isLoaded ? "loaded" : "loading"}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
            Leaderboard
          </h1>
          <hr className="mb-6" />
          <div className="search-controls">
            <div className="search-input-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <Input
                type="text"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            )}
          </div>
          <div className="results-info">
            Showing {filteredUsers.length} users
            {totalPages > 1 && (
              <>
                {" "}
                • Page {currentPage} of {totalPages}
              </>
            )}
          </div>
        </div>
        <div className="table-wrapper">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr className="data-table-header">
                  <th className="data-table-header-cell center" style={{ width: "4rem" }}>
                    Rank
                  </th>
                  <th
                    className="data-table-header-cell center sortable"
                    onClick={() => handleSort("rating")}
                    style={{ width: "8rem" }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Rating
                      <FontAwesomeIcon icon={getSortIcon("rating")} className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="data-table-header-cell sortable"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <FontAwesomeIcon icon={getSortIcon("name")} className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="data-table-body-cell center" style={{ height: "6rem" }}>
                      <span className="text-muted-foreground">
                        {searchTerm
                          ? "No users found matching your search."
                          : "No users available."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={user.name} className="data-table-body-row">
                      <td className="data-table-body-cell center">
                        <span className="font-bold text-lg">#{startIndex + index + 1}</span>
                      </td>
                      <td className="data-table-body-cell center" style={{ verticalAlign: "middle" }}>
                        <RatingDisplay rating={user.rating} showIcon={true} />
                      </td>
                      <td className="data-table-body-cell">
                        <Link
                          href={`/user/${user.id}`}
                          className="name-link"
                          title={getRatingTitle(user.rating)}
                        >
                          <NameDisplay name={user.name} rating={user.rating} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  if (
                    pageNumber === currentPage - 2 &&
                    currentPage > 4 &&
                    totalPages > 7
                  ) {
                    return (
                      <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (
                    pageNumber === currentPage + 2 &&
                    currentPage < totalPages - 3 &&
                    totalPages > 7
                  ) {
                    return (
                      <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {currentUsers.length > 0 && (
          <div className="mt-6 text-sm text-muted-foreground">
            <p>Click on a name to view their profile and detailed statistics.</p>
          </div>
        )}
      </div>
    </main>
  );
}