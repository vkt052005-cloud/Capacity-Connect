import React from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { CompetencyMappingEngine } from "../../components/competency/CompetencyMappingEngine";

export const CompetencyMapping: React.FC = () => {
  return (
    <DashboardLayout
      pageTitle="Competency Mapping Engine"
      breadcrumbs={[
        { label: "Admin Dashboard", to: "/admin/dashboard" },
        { label: "Competency Mapping" }
      ]}
    >
      <CompetencyMappingEngine />
    </DashboardLayout>
  );
};
export default CompetencyMapping;
