// ==============================================================================
// SPRACHCAFÉ POLNISCH E.V. - POWER BI M-QUERIES (Power Query)
// ==============================================================================

// ------------------------------------------------------------------------------
// Query 1: Parameter für SharePoint Site URL & Lokalen Pfad
// ------------------------------------------------------------------------------
let
    SharePointSiteUrl = "https://sprachcafepolnisch.sharepoint.com/sites/intranet" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=true],
    LocalFilePath = "C:\SprachCafe\scripts\kpi_exports\Veranstaltungs_Kennzahlen.csv" meta [IsParameterQuery=true, Type="Text", IsParameterQueryRequired=false]
in
    SharePointSiteUrl

// ------------------------------------------------------------------------------
// Query 2: Veranstaltungs_Kennzahlen (Aggregierte KPI-Tabelle)
// ------------------------------------------------------------------------------
// Quelle A: SharePoint Folder (Standard in M365)
let
    Source = SharePoint.Files("https://sprachcafepolnisch.sharepoint.com/sites/intranet", [ApiVersion = 15]),
    FilteredFiles = Table.SelectRows(Source, each ([Name] = "Veranstaltungs_Kennzahlen.csv" or [Name] = "calendar-kpi-summary.csv")),
    FileContent = FilteredFiles{0}[Content],
    ImportedCsv = Csv.Document(FileContent, [Delimiter=",", Columns=11, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(ImportedCsv, [PromoteAllScalars=true]),
    TypedTable = Table.TransformColumnTypes(PromotedHeaders,{
        {"Jahr_Monat", type text},
        {"Jahr", Int64.Type},
        {"Monat_Nummer", Int64.Type},
        {"Monat_Name", type text},
        {"Standort_Code", type text},
        {"Standort_Name", type text},
        {"Sprache", type text},
        {"Zielgruppe", type text},
        {"Kategorie", type text},
        {"Projekt", type text},
        {"Anzahl_Veranstaltungen", Int64.Type}
    })
in
    TypedTable

// ------------------------------------------------------------------------------
// Query 3: Events_Detail (Detaillierte Einzeltermine)
// ------------------------------------------------------------------------------
let
    Source = SharePoint.Files("https://sprachcafepolnisch.sharepoint.com/sites/intranet", [ApiVersion = 15]),
    FilteredFiles = Table.SelectRows(Source, each ([Name] = "Events_Detail_PowerBI.csv")),
    FileContent = FilteredFiles{0}[Content],
    ImportedCsv = Csv.Document(FileContent, [Delimiter=",", Columns=18, Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    PromotedHeaders = Table.PromoteHeaders(ImportedCsv, [PromoteAllScalars=true]),
    TypedTable = Table.TransformColumnTypes(PromotedHeaders,{
        {"Event_ID", type text},
        {"Titel", type text},
        {"Datum", type date},
        {"Uhrzeit_Start", type time},
        {"Uhrzeit_Ende", type time},
        {"Dauer_Minuten", Int64.Type},
        {"Jahr_Monat", type text},
        {"Jahr", Int64.Type},
        {"Monat", Int64.Type},
        {"Wochentag", type text},
        {"Standort_Code", type text},
        {"Standort_Name", type text},
        {"Zielgruppe_DE", type text},
        {"Zielgruppe_PL", type text},
        {"Sprachen", type text},
        {"Kategorie", type text},
        {"Projekt", type text},
        {"Kalender_Quelle", type text}
    })
in
    TypedTable

// ------------------------------------------------------------------------------
// Query 4: DAX Measures (Kennzahlen-Tabelle)
// ------------------------------------------------------------------------------
/*
Measures in Tabular Model:

Gesamt_Veranstaltungen = SUM(Veranstaltungs_Kennzahlen[Anzahl_Veranstaltungen])

Veranstaltungen_Kinder = CALCULATE(
    [Gesamt_Veranstaltungen],
    Veranstaltungs_Kennzahlen[Kategorie] = "Kinder & Familie"
)

Veranstaltungen_Sprachpraxis = CALCULATE(
    [Gesamt_Veranstaltungen],
    Veranstaltungs_Kennzahlen[Kategorie] = "Sprachpraxis & Tandem"
)

Veranstaltungen_Kultur = CALCULATE(
    [Gesamt_Veranstaltungen],
    Veranstaltungs_Kennzahlen[Kategorie] = "Kunst, Kultur & Literatur"
)

Anzahl_Standorte = DISTINCTCOUNT(Veranstaltungs_Kennzahlen[Standort_Code])

Anzahl_Monate = DISTINCTCOUNT(Veranstaltungs_Kennzahlen[Jahr_Monat])

Durchschnitt_Events_Pro_Monat = DIVIDE([Gesamt_Veranstaltungen], [Anzahl_Monate], 0)

Anteil_Pankow_Pct = DIVIDE(
    CALCULATE([Gesamt_Veranstaltungen], Veranstaltungs_Kennzahlen[Standort_Code] = "pankow"),
    [Gesamt_Veranstaltungen],
    0
)

Zweisprachig_Quote_Pct = 1.0  // 100% aller Veranstaltungen im SprachCafé sind zweisprachig (DE/PL)
*/
