import { Link } from "@inertiajs/react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import React from "react";

export default function SimplePagination({ 
    currentPage = 1, 
    lastPage = 1, 
    from = 0, 
    to = 0, 
    total = 0,
    links = []
}) {
    // Build simple pagination links if not provided
    if (!links || links.length === 0) {
        links = [];
        
        // Previous button
        if (currentPage > 1) {
            links.push({
                url: `?page=${currentPage - 1}`,
                label: 'Previous',
                active: false
            });
        }
        
        // Current page
        links.push({
            url: null,
            label: String(currentPage),
            active: true
        });
        
        // Next button
        if (currentPage < lastPage) {
            links.push({
                url: `?page=${currentPage + 1}`,
                label: 'Next',
                active: false
            });
        }
    }

    const prevDisabled = currentPage <= 1;
    const nextDisabled = currentPage >= lastPage;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Info */}
            <div className="text-sm text-gray-700">
                Menampilkan <span className="font-medium">{from}</span> hingga{' '}
                <span className="font-medium">{to}</span> dari{' '}
                <span className="font-medium">{total}</span> data
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Link
                    href={links.find(l => l.label.includes('Previous'))?.url || '#'}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        prevDisabled 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={prevDisabled}
                    preserveScroll
                >
                    <IconChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                    Previous
                </Link>

                {/* Page Info */}
                <div className="px-3 py-2 text-sm text-gray-700">
                    Halaman {currentPage} dari {lastPage}
                </div>

                {/* Next Button */}
                <Link
                    href={links.find(l => l.label.includes('Next'))?.url || '#'}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        nextDisabled 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled={nextDisabled}
                    preserveScroll
                >
                    Next
                    <IconChevronRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
            </div>
        </div>
    );
}
