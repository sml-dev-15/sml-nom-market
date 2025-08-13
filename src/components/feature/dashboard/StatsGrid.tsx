import StatsCard from "./StatsCard";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
      <StatsCard title="🌱 Crops" description="Active fields" value={12} />
      <StatsCard title="🚜 Equipment" description="Machines in use" value={5} />
      <StatsCard
        title="💧 Water Usage"
        description="Liters this week"
        value={2450}
      />
    </div>
  );
}
