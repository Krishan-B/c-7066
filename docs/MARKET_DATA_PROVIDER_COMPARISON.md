# Market Data Provider Comparison for Trade-Pro

Date: June 16, 2025

This document compares Yahoo Finance, Alpha Vantage, Finnhub, and Polygon.io as potential market data providers for the Trade-Pro project, considering the specific asset list provided.

## Asset List for Trade-Pro:

- **Stocks (30 major US equities):** AAPL, AMZN, GOOGL, TSLA, MSFT, META, NVDA, JPM, BAC, WFC, PFE, JNJ, PG, KO, PEP, WMT, XOM, CVX, INTC, AMD, NFLX, ADBE, CRM, V, MA, HD, BA, CAT, MCD, MRK.
- **Indices (15 global indices):** US500 (S&P 500), US100 (NASDAQ 100), US30 (Dow Jones), UK100 (FTSE 100), DE40 (DAX 40), JP225 (Nikkei 225), FR40 (CAC 40), EU50 (EURO STOXX 50), HK50 (Hang Seng), AUS200 (ASX 200), CN50 (Shanghai Composite), ES35 (IBEX 35), IT40 (FTSE MIB), CA60 (S&P/TSX Composite), KS200 (KOSPI).
  - _Note: These are common CFD/broker symbols; actual API symbols will differ._
- **Commodities (15 commodities):** XAU/USD (Gold), XAG/USD (Silver), USOIL (WTI Crude), UKOIL (Brent Crude), NG (Natural Gas), COPPER, COFFEE, SOYBN, XPT/USD (Platinum), XPD/USD (Palladium), CORN, WHEAT, SUGAR, COCOA, COTTON.
  - _Note: These are common CFD/broker symbols; actual API symbols will represent futures contracts or specific spot rates._
- **Forex (15 FX pairs):** EUR/USD, USD/JPY, GBP/USD, AUD/USD, USD/CAD, USD/CHF, EUR/GBP, NZD/USD, EUR/JPY, GBP/JPY, AUD/JPY, USD/CNH, EUR/AUD, USD/ZAR, USD/SGD.
- **Crypto (12 cryptocurrencies):** BTC/USD, ETH/USD, XRP/USD, LTC/USD, BCH/USD, SOL/USD, ADA/USD, DOGE/USD, BNB/USD, DOT/USD, LINK/USD, AVAX/USD.

---

## Provider Overviews and Asset Coverage Assessment

### 1. Yahoo Finance (via `yfinance` library)

- **Overview:** Provides broad financial data scraped from Yahoo Finance's public website. Accessed via unofficial APIs. The `yfinance` Python library is a common interface.
- **Cost:** Free.
- **Strengths:** Wide range of asset classes, extensive historical daily data for many assets, rich set of fundamental data for equities, news. No direct cost.
- **Weaknesses:**

  - **Reliability:** Unofficial API; can break when Yahoo changes its site. No SLAs.
  - **Rate Limits:** Undocumented and variable; excessive requests can lead to IP bans. High risk for frequent polling.
  - **Data Delays:** Not true real-time; data is often delayed (15-20 min for some exchanges, varies for others).
  - **Historical Intraday Data:** Very limited lookback (e.g., 1-min data for ~7-30 days).
  - **L2 Market Depth:** Not available.
  - **Symbol Conventions:** Generally uses exchange-standard tickers (e.g., `MSFT`, `^GSPC` for S&P 500, `EURUSD=X` for Forex).

- **Asset List Coverage (Based on previous investigation):**
  - **Stocks:** All 30 US stocks listed should be well-covered with historical and fundamental data.
  - **Indices:** Major global indices are available (e.g., S&P 500 as `^GSPC`, NASDAQ 100 as `^NDX` or similar, FTSE 100 as `^FTSE`). The specific symbols like `US500` will need mapping to Yahoo's tickers. Coverage for all 15 should be good.
  - **Commodities:** Provides data for commodity futures (e.g., Gold as `GC=F`, Crude Oil as `CL=F`) and some spot rates (e.g., `XAUUSD=X` might exist or need mapping). Coverage for the listed commodities is generally good via their respective futures contract symbols or common spot tickers.
  - **Forex:** Major and minor pairs are available (e.g., `EURUSD=X`, `GBPUSD=X`). All 15 listed pairs should be covered.
  - **Crypto:** Good coverage for major cryptocurrencies (e.g., `BTC-USD`, `ETH-USD`). All 12 listed cryptos should be available.

---

### 2. Alpha Vantage

- **Overview:** Offers a wide range of APIs for stocks, forex, cryptocurrencies, economic indicators, and technical indicators. Provides an official API with free and paid tiers.
- **Cost:**
  - **Free Tier:** Limited requests (e.g., historically 5 API requests per minute and 500 requests per day, but this can change and should be verified from their current terms). Data quality and availability might be reduced on the free tier for some endpoints.
  - **Paid Tiers:** Offer higher API limits, potentially more data sources, better reliability, and customer support. Prices vary based on usage levels.
- **Strengths:**
  - Official API with documentation.
  - Broad asset class coverage.
  - Extensive historical data for many assets.
  - Technical indicator endpoints.
  - Clear distinction between free and paid offerings.
- **Weaknesses:**

  - **Rate Limits (Free Tier):** Can be restrictive for applications requiring frequent updates or data for many symbols.
  - **Data Delays:** Real-time data is typically a premium feature; free tier data is often delayed (similar to Yahoo Finance, e.g., 15-20 minutes for US stocks).
  - **Data Quality/Completeness:** Some users have reported inconsistencies or gaps, especially on the free tier or for less common assets. Premium tiers usually offer better quality.
  - **Historical Intraday Data:** Similar to other providers, long-term intraday history might be limited, especially on the free tier. Premium tiers may offer more.
  - **L2 Market Depth:** Generally not available, especially on free/lower-tier plans.
  - **Symbol Conventions:** Uses standard stock tickers. Forex pairs like `EURUSD`. Crypto like `BTCUSD`.

- **Asset List Coverage (General Assessment):**
  - **Stocks:** All 30 US stocks should be covered, especially on paid plans. Free tier might have limitations on data frequency or history for some.
  - **Indices:** Provides data for major indices. Mapping CFD symbols like `US500` to Alpha Vantage recognized symbols (e.g., `SPY` for S&P 500 ETF as a proxy, or specific index tickers if available) would be needed. Coverage for all 15 needs verification, especially for international ones on the free tier.
  - **Commodities:** Alpha Vantage has APIs for commodities, often providing prices for futures contracts or related indicators. Coverage for the 15 listed commodities (e.g., WTI, Brent, Gold, Silver, Natural Gas, Copper, agricultural) needs to be verified against their specific commodity API endpoints and symbol conventions. Spot prices like `XAU/USD` might be available via Forex or Crypto APIs if treated as such, or require specific commodity tickers.
  - **Forex:** Good coverage for major and many minor FX pairs. All 15 listed pairs should be available.
  - **Crypto:** Extensive list of supported cryptocurrencies. All 12 listed cryptos should be well-covered.

---

### 3. Finnhub

- **Overview:** Provides a wide array of financial data APIs, including real-time stock, forex, and crypto data, as well as fundamental data, news, and alternative data. Offers both free and paid plans.
- **Cost:**
  - **Free Tier:** Limited access to APIs with restrictions on the number of requests and data history.
  - **Paid Tiers:** Remove most limitations of the free tier, offering more requests, advanced data, and additional features. Pricing varies based on the level of access and usage.
- **Strengths:**
  - Comprehensive coverage including alternative data (e.g., sentiment, social media).
  - Real-time data for stocks, forex, and crypto even on the free tier (with limitations).
  - Official API with good documentation.
  - Reasonably priced paid tiers for the data offered.
- **Weaknesses:**

  - **Rate Limits (Free Tier):** Quite restrictive, limiting the number of requests and the frequency of data access.
  - **Data Delays:** Some data, especially on the free tier, may not be real-time or may have limited history.
  - **Data Quality/Completeness:** As with many providers, there can be occasional gaps or inconsistencies in the data.
  - **Historical Intraday Data:** Limited availability, especially on the free tier. Paid tiers offer more extensive historical data.
  - **L2 Market Depth:** Not available.
  - **Symbol Conventions:** Uses standard ticker symbols for stocks, forex pairs, and cryptocurrencies.

- **Asset List Coverage (General Assessment):**
  - **Stocks:** Should be well-covered, but the free tier may limit access to historical data or frequency of updates.
  - **Indices:** Coverage is likely good for major indices, but specific CFD symbols like `US500` may need to be mapped to Finnhub's symbols.
  - **Commodities:** Coverage needs verification; not all commodity symbols may be directly supported, and some mapping might be required.
  - **Forex:** Good coverage for all listed FX pairs.
  - **Crypto:** Extensive coverage for cryptocurrencies, likely including all listed.

---

### 4. Polygon.io

- **Overview:** Provides real-time and historical market data for US stocks, options, forex, and cryptocurrencies. Known for high-quality data and developer-friendly APIs, including WebSockets.
- **Cost:**
  - **Free Tier (Limited):** Offers a very limited free tier, primarily for API familiarization, with significant restrictions on data access (e.g., end-of-day historical data only, very low rate limits, limited symbols).
  - **Paid Tiers:** Various subscription levels for stocks, options, forex, and crypto, with different levels of real-time data (NBBO, full market depth/L2), historical data access, and API limits. Can be expensive, especially for full real-time L2 data across multiple asset classes.
- **Strengths:**
  - High-quality, accurate data, especially for US markets.
  - Developer-friendly APIs with good documentation.
  - True real-time streaming data via WebSockets for subscribers (including L2 market depth for US stocks).
  - Extensive historical data, including tick-level data on some plans.
- **Weaknesses:**

  - **Cost:** Can be one of the more expensive options, particularly for comprehensive real-time data and deep historical access.
  - **Free Tier:** Very restrictive and not suitable for a production application or even thorough development testing for many features.
  - **Asset Class Focus:** Strongest in US equities and options. While Forex and Crypto are well-supported, global equities coverage outside the US might be less comprehensive or require specific (costly) data packages.
  - **Commodities:** Not a primary focus. Direct data for the 15 listed commodities (especially futures or broad spot rates) is unlikely to be a core offering. Users might get commodity exposure via ETFs or stocks of related companies.
  - **Symbol Conventions:** Uses standard stock tickers (e.g., `AAPL`). Forex `C:EURUSD`. Crypto `X:BTCUSD`.

- **Asset List Coverage (General Assessment):**
  - **Stocks:** All 30 US stocks listed will be exceptionally well-covered with high-quality historical and real-time data (including L2) on appropriate paid plans.
  - **Indices:** Provides data for major US indices (e.g., S&P 500, NASDAQ, Dow). Mapping CFD symbols needed. Coverage for the international indices on your list (UK100, DE40, JP225, etc.) would require checking their specific global data offerings, which might be add-ons or part of higher-tier enterprise plans. Real-time global indices can be very costly.
  - **Commodities:** Unlikely to have direct, comprehensive coverage for the 15 listed physical commodities or their primary futures contracts. This is a significant gap for Polygon.io concerning your list.
  - **Forex:** Excellent coverage for a vast number of forex pairs, including all 15 on your list, with real-time data available on paid plans.
  - **Crypto:** Strong coverage for a wide array of cryptocurrencies from various exchanges, including all 12 on your list, with real-time data available on paid plans.

---

## 5. Comparative Summary and Recommendation

**Objective:** Summarize the findings for all four providers against Trade-Pro's asset list and key PRD requirements (real-time, historical data, L2 data, reliability, cost) and provide a recommendation.

| Feature/Aspect           | Yahoo Finance (`yfinance`) | Alpha Vantage                         | Finnhub.io                               | Polygon.io                                  |
| :----------------------- | :------------------------- | :------------------------------------ | :--------------------------------------- | :------------------------------------------ |
| **Overall Cost**         | Free                       | Free Tier (limited) / Paid            | Free Tier (limited) / Paid               | Very Limited Free / Paid (Potentially High) |
| **Official API**         | No (Unofficial, Scraped)   | Yes                                   | Yes                                      | Yes                                         |
| **Reliability Risk**     | High (API changes, no SLA) | Medium (Free) / Low (Paid)            | Medium (Free) / Low (Paid)               | Low (Paid)                                  |
| **Rate Limits**          | Undocumented, Variable     | Restrictive (Free)                    | Restrictive (Free)                       | Very Restrictive (Free)                     |
| **Real-Time Data**       | Delayed                    | Delayed (Free) / Yes (Paid)           | Delayed (Free) / Yes (Paid, US Stock WS) | Delayed (Free) / Yes (Paid, WS)             |
| **L2 Market Depth**      | No                         | No                                    | No (Generally)                           | Yes (US Stocks, Paid)                       |
| **Historical Daily**     | Good (Extensive)           | Good                                  | Good                                     | Excellent (Paid)                            |
| **Historical Intraday**  | Very Limited Lookback      | Limited (Free) / Fair (Paid)          | Limited (Free) / Fair (Paid)             | Good (Paid)                                 |
| **Stocks Coverage**      | Good                       | Good                                  | Good                                     | Excellent (US)                              |
| **Indices Coverage**     | Good (Mapping needed)      | Fair-Good (Mapping, Free limitations) | Fair-Good (Mapping, Free limitations)    | Fair (US) / Costly (Global)                 |
| **Commodities Coverage** | Good (Futures/Spot)        | Fair (Needs verification)             | Limited (Needs verification)             | **Poor (Major Gap)**                        |
| **Forex Coverage**       | Good                       | Good                                  | Good                                     | Excellent                                   |
| **Crypto Coverage**      | Good                       | Good                                  | Good                                     | Excellent                                   |

**Key Considerations from PRD for this Decision:**

- **Market Data Source (PRD 3.3.1):** PRD currently mandates Yahoo Finance. This comparison shows its significant limitations (reliability, rate limits, delays, no L2).
- **Real-time Data Flow (PRD 4.4) & Charting (PRD 3.6.3):** True real-time is not feasible with Yahoo or free tiers of other providers. Paid plans are needed for low-latency real-time.
- **Market Depth (L2) (PRD 3.6.2):** If L2 data is a strict requirement, only Polygon.io (paid) clearly offers this for US stocks. Other providers generally do not.
- **Scalability & Reliability (PRD 5.1, 5.2):** Relying on free or unofficial APIs poses a high risk to scalability and reliability.

**Analysis:**

- **Yahoo Finance:** While free and covering all asset _types_, its unreliability, rate limits, data delays, and lack of L2 data make it a high-risk choice for a platform aiming for the robustness described in the PRD. It meets the _letter_ of the current PRD (which specifies Yahoo) but not the _spirit_ of a reliable trading simulation platform.
- **Alpha Vantage:** The free tier is too restrictive. Paid tiers improve this but L2 data is still an issue, and commodity coverage needs more detailed verification.
- **Finnhub.io:** Similar to Alpha Vantage; free tier is restrictive. Paid tiers are more capable (including some real-time WebSockets for US stocks) but L2 is generally absent, and commodity coverage is a concern. Your manual edits indicate Finnhub might offer L2 on higher tiers, which is a positive point if confirmed and budgeted.
- **Polygon.io:** Offers the highest quality data, true real-time streaming, and L2 for US stocks on paid plans. It excels for US Stocks, Forex, and Crypto. However, it's likely the most expensive, and its direct commodity coverage for your specific list is a major weakness.

**Addressing the Gaps:**

No single _free_ provider perfectly meets all requirements, especially regarding real-time data, L2 depth, and comprehensive commodity coverage without reliability concerns.

If the project **must remain on a free tier or very low budget:**

- **Yahoo Finance (`yfinance`)** remains the broadest in terms of free asset _type_ coverage (including commodities). However, the project must accept its significant drawbacks: unreliability, rate limits, data delays, no L2 data, and limited intraday history. Mitigation (heavy caching, throttling, user disclaimers) is essential.
- A **hybrid approach** could be considered: e.g., Yahoo for general coverage and a free/low-cost tier from another provider for specific needs if Yahoo fails, but this adds complexity.

If the project **can allocate a budget for market data (Recommended for PRD alignment):**

- **Finnhub.io (Paid Tier):** Based on your edits suggesting potential L2 availability and its generally good coverage for Stocks, Forex, and Crypto, a paid Finnhub plan could be a balanced choice if its commodity coverage can be confirmed or supplemented. Its real-time capabilities on paid tiers are a plus.
- **Polygon.io (Paid Tier):** The best choice for data quality, real-time US stocks (with L2), Forex, and Crypto. However, the **major gap in commodity coverage** would need to be addressed separately (e.g., by augmenting with another provider specifically for commodities, or by reducing the commodity offering). It is also likely the most expensive.

**Recommendation Scenarios:**

1.  **Scenario 1: Strict Adherence to PRD's current mention of "Yahoo Finance" AND No Budget:**

    - **Proceed with Yahoo Finance (`yfinance`).**
    - **Acknowledge and document all risks and limitations** (unreliability, delays, rate limits, no L2, limited intraday history).
    - **Implement extensive mitigation strategies:** robust caching, request throttling, error handling, clear user disclaimers regarding data quality and delays.
    - **Propose PRD amendments:** Modify sections on real-time expectations, L2 data (mark as not feasible or for future), and explicitly state reliance on unofficial API with its risks.

2.  **Scenario 2: Flexibility to Choose Best Provider (Budget Dependent) to better meet PRD spirit:**
    - **If Budget is Available & Commodities are Key:** A **paid Finnhub.io plan** seems like a strong contender, _provided_ its commodity coverage for your list is adequate and L2 data (if needed) is confirmed to be available and within budget. It offers a good balance of real-time capabilities and asset coverage.
    - **If Budget is Available & Highest Quality US Stock/Forex/Crypto Data + L2 is Key (and Commodities can be sourced elsewhere or de-prioritized):** A **paid Polygon.io plan** is superior for these core assets. The commodity gap is the main issue here.
    - **If Sticking to Free/Very Low Cost but want an Official API:** **Alpha Vantage (Free Tier)** could be used, but its rate limits are very challenging. It would require even more aggressive caching and severely limit "real-time" feel. Commodity coverage is also a question mark.

**Given the PRD's aim for a comprehensive, multi-asset platform, and the issues with free tiers, a paid solution is highly recommended for long-term viability and user experience.**

**Immediate Next Step Recommendation:**

1.  **Clarify PRD Ambiguities:** Get definitive answers on the criticality of:
    - True real-time (vs. delayed) data.
    - Level 2 Market Depth data.
    - The 15 listed commodities (are they all hard requirements?)
2.  **Determine Budget:** Understand if there is any budget for market data.
3.  **Based on #1 and #2, select the primary data provider.**
    - If the decision is to stick with Yahoo Finance (as per current PRD text), then the migration plan should focus on replacing existing sources with `yfinance` and building extensive mitigation layers.
    - If a paid provider is chosen, the migration plan will involve integrating that provider's API.

For the purpose of this exercise, if we assume the PRD is updated to allow a more reliable provider and a modest budget exists, **Finnhub.io (paid tier)** appears to offer the best balance across your listed asset classes, assuming its commodity coverage is verified as sufficient and L2 data is available if critical. It avoids the extreme cost of Polygon.io while being more reliable than Yahoo Finance or free tiers of Alpha Vantage.

However, if the **strict interpretation of the current PRD (Yahoo Finance) must be followed**, then the migration plan must focus on that, with all its caveats.
