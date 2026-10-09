import Link from "next/link";
import type { Vacancy } from "@/lib/types";
import { experienceLabel, jobTypeLabel } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";
import Icon from "./Icon";

export default function JobCard({ vacancy: v }: { vacancy: Vacancy }) {
  const meta = "text-xs12 flex items-center gap-1";
  return (
    <Link
      href={`/jobs/${v.id}`}
      data-testid="job-card"
      className="flex h-32 gap-4 rounded border border-line bg-white p-4 transition hover:shadow-sm"
    >
      <CompanyLogo size={96} />
      <div className="flex flex-1 items-start justify-between gap-4">
        <div className="flex flex-col gap-4 pb-2">
          <h3 className="heading-h6">{v.title}</h3>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-4">
              <span className={meta}>
                <Icon name="building" />
                {v.company.name}
              </span>
              {/* The list design writes "Full-time" while the badge and form write "Full-Time". */}
              <span className="text-xs12">{jobTypeLabel(v.job_type).replace("-Time", "-time")}</span>
            </div>
            <div className="flex flex-wrap gap-x-4">
              <span className={meta}>
                <Icon name="location" />
                {v.location}
                {v.is_remote && " (Remote)"}
              </span>
              <span className={meta}>
                <Icon name="briefcase" />
                {experienceLabel(v.min_experience)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs12 hidden flex-col items-end gap-2 whitespace-nowrap text-muted sm:flex">
          <p>Dibuat pada {formatDate(v.created_at)}</p>
          <p>Lamar sebelum {formatDate(v.active_until)}</p>
        </div>
      </div>
    </Link>
  );
}
