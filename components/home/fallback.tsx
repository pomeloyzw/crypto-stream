import { DataTable } from "@/components/DataTable"

export function CoinOverviewFallback() {
  return (
    <div id="coin-overview-fallback">
      <div className="header">
        <div className="header-image bg-dark-400" />
        <div className="info">
          <div className="header-line-lg bg-dark-400 rounded" />
          <div className="header-line-sm bg-dark-400 rounded" />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="period-button-skeleton bg-dark-400 rounded" />
        <div className="period-button-skeleton bg-dark-400 rounded" />
        <div className="period-button-skeleton bg-dark-400 rounded" />
      </div>

      <div className="chart">
        <div className="chart-skeleton bg-dark-400" />
      </div>
    </div>
  )
}

export function TrendingCoinsFallback() {
  const data = new Array(5).fill(null).map((_, i) => ({ id: i }))

  const columns = [
    {
      header: "Name",
      headClassName: "",
      cell: () => (
        <div className="trending-coins-table">
          <div className="name-cell">
            <div className="name-link">
              <div className="name-image bg-dark-400" />
              <div className="name-line bg-dark-400 rounded" />
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "24h Change",
      cell: () => (
        <div className="name-cell">
          <div className="price-change">
            <div className="change-icon bg-dark-400" />
            <div className="change-line bg-dark-400 rounded" />
          </div>
        </div>
      ),
    },
    {
      header: "Price",
      cell: () => <div className="price-cell"><div className="price-line bg-dark-400 rounded" /></div>,
    },
    
  ]

  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <div className="trending-coins-table">
        <DataTable
          columns={columns}
          data={data}
          rowKey={(r) => r.id}
        />
      </div>
    </div>
  )
}
