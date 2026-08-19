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
// Query 3: Veranstaltungs_Rueckmeldungen (M365 Adaptive Cards Feedback)
// ------------------------------------------------------------------------------
let
    Source = SharePoint.Tables("https://sprachcafepolnisch.sharepoint.com/sites/intranet", [ApiVersion = 15]),
    TableData = Source{[Id="Veranstaltungs_Rueckmeldungen"]}[Data],
    TypedTable = Table.TransformColumnTypes(TableData,{
        {"Title", type text},
        {"EventDatum", type date},
        {"Standort", type text},
        {"TeilnehmerGesamt", Int64.Type},
        {"DavonKinder", Int64.Type},
        {"SpendenBar", type number},
        {"Notiz", type text},
        {"ErfasstDurch", type text}
    })
in
    TypedTable

// ------------------------------------------------------------------------------
// Query 4: Cloudflare_Analytics (Live Web Traffic)
// ------------------------------------------------------------------------------
let
    Source = Json.Document(Web.Contents("https://xn--sprachcaf-j4a.org/data/cloudflare-analytics.json")),
    Metrics = Source[metrics],
    TableData = Table.FromRecords({Metrics})
in
    TableData

// ------------------------------------------------------------------------------
// Query 5: Buchhaltung_Spenden (Agnieszka Kubalewska-Strohmeyer)
// ------------------------------------------------------------------------------
let
    Source = SharePoint.Tables("https://sprachcafepolnisch.sharepoint.com/sites/intranet", [ApiVersion = 15]),
    TableData = Source{[Id="Buchhaltung_Spenden"]}[Data],
    TypedTable = Table.TransformColumnTypes(TableData,{
        {"Title", type text},
        {"BerichtsMonat", type text},
        {"SpendenAllgemein", type number},
        {"SpendenZweckgebunden", type number},
        {"Mitgliedsbeitraege", type number},
        {"Bemerkungen", type text}
    })
in
    TypedTable
