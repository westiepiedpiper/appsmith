import { ObjectsRegistry } from "../../../../support/Objects/Registry";

let guid: any, dsName: any, query: string;
const agHelper = ObjectsRegistry.AggregateHelper,
  ee = ObjectsRegistry.EntityExplorer,
  dataSources = ObjectsRegistry.DataSources,
  propPane = ObjectsRegistry.PropertyPane,
  table = ObjectsRegistry.Table,
  locator = ObjectsRegistry.CommonLocators,
  deployMode = ObjectsRegistry.DeployMode;

describe("Postgres - Datatype Json & JsonB types tests", function() {
  before(() => {
    cy.fixture("JsonDTdsl").then((val: any) => {
      agHelper.AddDsl(val);
    });
    propPane.ChangeColor(33, "Primary");
    propPane.ChangeColor(39, "Background");

    agHelper.GenerateUUID();
    cy.get("@guid").then((uid) => {
      dataSources.NavigateToDSCreateNew();
      dataSources.CreatePlugIn("PostgreSQL");
      guid = uid;
      agHelper.RenameWithInPane("Postgres " + guid, false);
      dataSources.FillPostgresDSForm();
      dataSources.TestSaveDatasource();
      cy.wrap("Postgres " + guid).as("dsName");
    });
    cy.get("@dsName").then(($dsName) => {
      dsName = $dsName;
    });
  });

  //#region Json Datatype

  it("1. Creating enum & table queries - jsonbooks", () => {
    query = `CREATE TYPE genres AS ENUM ('Fiction', 'Thriller', 'Horror', 'Marketing & Sales', 'Self-Help', 'Psychology', 'Law', 'Politics', 'Productivity', 'Reference', 'Spirituality');`;
    dataSources.NavigateFromActiveDS(dsName, true);
    agHelper.GetNClick(dataSources._templateMenu);
    agHelper.RenameWithInPane("createEnum");
    dataSources.EnterQuery(query);
    dataSources.RunQuery();

    query = `CREATE TABLE jsonbooks(serialId SERIAL PRIMARY KEY, details JSON)`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("createTable");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);
    dataSources.RunQuery();

    ee.ActionContextMenuByEntityName(dsName, "Refresh");
    agHelper.AssertElementVisible(ee._entityNameInExplorer("public.jsonbooks"));
  });

  it("2. Creating SELECT query - jsonbooks + Bug 14493", () => {
    ee.ActionTemplateMenuByEntityName("public.jsonbooks", "SELECT");
    agHelper.RenameWithInPane("selectRecords");
    dataSources.RunQuery();
    agHelper
      .GetText(dataSources._noRecordFound)
      .then(($noRecMsg) => expect($noRecMsg).to.eq("No data records to show"));
  });

  it("3. Creating all queries - jsonbooks", () => {
    query = `INSERT INTO jsonbooks(details) VALUES('{"customer": "{{InsertJSONForm.formData.customer}}", "title": "{{InsertJSONForm.formData.title}}", "type": {{InsertJSONForm.formData.type}}, "info": {"published": {{InsertJSONForm.formData.info.published}}, "price": {{InsertJSONForm.formData.info.price}}}}');`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("insertRecord");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);
    dataSources.ToggleUsePreparedStatement(false);

    query = `UPDATE public."jsonbooks" SET "details" = '{"customer": "{{UpdateJSONForm.formData.customer}}", "title": "{{UpdateJSONForm.formData.title}}", "type": {{UpdateJSONForm.formData.type}}, "info": {"published": {{UpdateJSONForm.formData.info.published}}, "price": {{UpdateJSONForm.formData.info.price}}}}' WHERE serialid = {{Table1.selectedRow.serialid}};`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("updateRecord");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);
    dataSources.ToggleUsePreparedStatement(false);

    query = `SELECT * from enum_range(NULL::genres)`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("getEnum");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);

    query = `DELETE FROM public."jsonbooks" WHERE serialId ={{Table1.selectedRow.serialid}}`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("deleteRecord");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);

    query = `DELETE FROM public."jsonbooks"`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("deleteAllRecords");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);

    query = `drop table public."jsonbooks"`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("dropTable");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);

    query = `drop type genres`;
    ee.CreateNewDsQuery(dsName);
    agHelper.RenameWithInPane("dropEnum");
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);

    ee.ExpandCollapseEntity("QUERIES/JS", false);
    ee.ExpandCollapseEntity(dsName, false);
  });

  it("5. Inserting record - jsonbooks", () => {
    ee.SelectEntityByName("Page1");
    deployMode.DeployApp();
    table.WaitForTableEmpty(); //asserting table is empty before inserting!
    agHelper.ClickButton("Run InsertQuery");
    agHelper.AssertElementVisible(locator._modal);

    deployMode.EnterJSONInputValue("Customer", "Lily Bush");
    deployMode.EnterJSONInputValue("Title", "PostgreSQL for Beginners");
    deployMode.SelectJsonFormMultiSelect("Type", ["Programming", "Computer"]);
    agHelper.ToggleSwitch("Published", "check", true);
    deployMode.EnterJSONInputValue("Price", "150");

    agHelper.ClickButton("Insert");
    agHelper.AssertElementAbsence(locator._toastMsg); //Assert that Insert did not fail
    agHelper.AssertElementVisible(locator._spanButton("Run InsertQuery"));
    table.ReadTableRowColumnData(0, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("1"); //asserting serial column is inserting fine in sequence
    });
    table.ReadTableRowColumnData(0, 1, 200).then(($cellData) => {
      expect($cellData).not.to.eq("");
    });
  });

  it("6. Inserting another record - jsonbooks", () => {
    agHelper.ClickButton("Run InsertQuery");
    agHelper.AssertElementVisible(locator._modal);

    deployMode.EnterJSONInputValue("Customer", "Josh William");
    deployMode.EnterJSONInputValue("Title", "Ivanhoe");
    deployMode.SelectJsonFormMultiSelect("Type", ["Adventure", "Novel"]);
    agHelper.ToggleSwitch("Published", "check", true);
    deployMode.EnterJSONInputValue("Price", "400");

    agHelper.ClickButton("Insert");
    agHelper.AssertElementVisible(locator._spanButton("Run InsertQuery"));
    table.ReadTableRowColumnData(1, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("2"); //asserting serial column is inserting fine in sequence
    });
    table.ReadTableRowColumnData(1, 1, 200).then(($cellData) => {
      expect($cellData).not.to.eq("");
    });
  });

  it("7. Inserting another record - jsonbooks", () => {
    agHelper.ClickButton("Run InsertQuery");
    agHelper.AssertElementVisible(locator._modal);

    deployMode.EnterJSONInputValue("Customer", "Mary Clark");
    deployMode.EnterJSONInputValue("Title", "The Pragmatic Programmer");
    deployMode.SelectJsonFormMultiSelect("Type", ["Programming"], 0, true);
    agHelper.ToggleSwitch("Published", "uncheck", true);
    deployMode.EnterJSONInputValue("Price", "360");

    agHelper.ClickButton("Insert");
    agHelper.AssertElementVisible(locator._spanButton("Run InsertQuery"));
    table.ReadTableRowColumnData(2, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("3"); //asserting serial column is inserting fine in sequence
    });
    table.ReadTableRowColumnData(2, 1, 200).then(($cellData) => {
      expect($cellData).not.to.eq("");
    });
  });

  it("8. Updating record - jsonbooks", () => {
    table.SelectTableRow(1);
    agHelper.ClickButton("Run UpdateQuery");
    agHelper.AssertElementVisible(locator._modal);

    deployMode.EnterJSONInputValue("Title", " Bill");//Adding Bill to name
    agHelper.ToggleSwitch("Published", "uncheck", true);
    deployMode.ClearJSONFieldValue("Price");
    deployMode.EnterJSONInputValue("Price", "660");

    agHelper.ClickButton("Update");
    agHelper.AssertElementAbsence(locator._toastMsg); //Assert that Update did not fail
    agHelper.AssertElementVisible(locator._spanButton("Run UpdateQuery"));
    table.ReadTableRowColumnData(1, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("3");
    });
    table.ReadTableRowColumnData(2, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("2"); //Since recently updated column to pushed to last!
    });
    table.ReadTableRowColumnData(2, 1, 200).then(($cellData) => {
      expect($cellData).not.to.eq("");
    });
  });

  it("9. Validating JSON functions", () => {
    deployMode.NavigateBacktoEditor();
    table.WaitUntilTableLoad();
    ee.ExpandCollapseEntity("QUERIES/JS");
    dataSources.NavigateFromActiveDS(dsName, true);
    agHelper.RenameWithInPane("verifyJsonFunctions");

    //Verifying -> - returns results in json format
    query = `SELECT details -> 'title' AS "BookTitle" FROM jsonbooks;`;
    agHelper.GetNClick(dataSources._templateMenu);
    dataSources.EnterQuery(query);
    dataSources.RunQuery();
    dataSources.AssertQueryResponseHeaders(["BookTitle"]);
    dataSources.ReadQueryTableResponse(0).then(($cellData) => {
      expect($cellData).to.eq("PostgreSQL for Beginners");
    });
    dataSources.ReadQueryTableResponse(1).then(($cellData) => {
      expect($cellData).to.eq("The Pragmatic Programmer");
    });
    dataSources.ReadQueryTableResponse(2).then(($cellData) => {
      expect($cellData).to.eq("Ivanhoe Bill");
    });

    //Verifying ->> - returns result in text format
    query = `SELECT details -> 'info' ->> 'price' AS "BookPrice" FROM jsonbooks;`;
    dataSources.EnterQuery(query);
    dataSources.RunQuery();
    dataSources.AssertQueryResponseHeaders(["BookPrice"]);
    dataSources.ReadQueryTableResponse(0).then(($cellData) => {
      expect($cellData).to.eq("150");
    });
    dataSources.ReadQueryTableResponse(1).then(($cellData) => {
      expect($cellData).to.eq("360");
    });
    dataSources.ReadQueryTableResponse(2).then(($cellData) => {
      expect($cellData).to.eq("660");
    });

    //Verifying 'CAST' with 'WHERE' clause
    query = `SELECT details -> 'customer' AS "P+ Customer", details -> 'info'  ->> 'price' as "Book Price" FROM jsonbooks where CAST (details -> 'info'  ->> 'price' as INTEGER) > 360;`
    dataSources.EnterQuery(query);
    dataSources.RunQuery();
    dataSources.AssertQueryResponseHeaders(["P+ Customer", "Book Price"]);
    dataSources.ReadQueryTableResponse(0).then(($cellData) => {
      expect($cellData).to.eq("Josh William");
    });
    dataSources.ReadQueryTableResponse(1).then(($cellData) => {
      expect($cellData).to.eq("660");
    });

    //Verifying Aggregate functions
    query = `SELECT MIN (CAST (details -> 'info'  ->> 'price' as INTEGER)), MAX (CAST (details -> 'info'  ->> 'price' as INTEGER)), SUM (CAST (details -> 'info'  ->> 'price' as INTEGER)), AVG (CAST (details -> 'info'  ->> 'price' as INTEGER)), count(*) FROM jsonbooks;`
    dataSources.EnterQuery(query);
    dataSources.RunQuery();
    dataSources.AssertQueryResponseHeaders(["min", "max", "sum", "avg", "count"]);
    dataSources.ReadQueryTableResponse(0).then(($cellData) => {
      expect($cellData).to.eq("150");
    });
    dataSources.ReadQueryTableResponse(1).then(($cellData) => {
      expect($cellData).to.eq("660");
    });
    dataSources.ReadQueryTableResponse(2).then(($cellData) => {
      expect($cellData).to.eq("1170");
    });
    dataSources.ReadQueryTableResponse(3).then(($cellData) => {
      expect($cellData).to.eq("390");
    });
    dataSources.ReadQueryTableResponse(4).then(($cellData) => {
      expect($cellData).to.eq("3");
    });

    agHelper.ActionContextMenuWithInPane("Delete");
    ee.ExpandCollapseEntity("QUERIES/JS", false);
  });

  it("10. Deleting records - jsonbooks", () => {
    ee.SelectEntityByName("Page1");
    deployMode.DeployApp();
    table.WaitUntilTableLoad();
    table.SelectTableRow(1);
    agHelper.ClickButton("DeleteQuery", 1);
    agHelper.ValidateNetworkStatus("@postExecute", 200);
    agHelper.ValidateNetworkStatus("@postExecute", 200);
    agHelper.Sleep(2500); //Allwowing time for delete to be success
    table.ReadTableRowColumnData(1, 0, 2000).then(($cellData) => {
      expect($cellData).not.to.eq("3"); //asserting 2nd record is deleted
    });
    table.ReadTableRowColumnData(1, 0, 200).then(($cellData) => {
      expect($cellData).to.eq("2");
    });
  });

  it("11. Deleting all records from table - jsonbooks", () => {
    agHelper.GetNClick(locator._deleteIcon);
    agHelper.AssertElementVisible(locator._spanButton("Run InsertQuery"));
    agHelper.Sleep(2000);
    table.WaitForTableEmpty();
  });

  it("12. Inserting another record (to check serial column) - jsonbooks", () => {
    agHelper.ClickButton("Run InsertQuery");
    agHelper.AssertElementVisible(locator._modal);

    deployMode.EnterJSONInputValue("Customer", "Bob Sim");
    deployMode.EnterJSONInputValue("Title", "Treasure Island");
    deployMode.SelectJsonFormMultiSelect("Type", ["Novel"]);
    agHelper.ToggleSwitch("Published", "uncheck", true);

    deployMode.EnterJSONInputValue("Price", "80");
    agHelper.AssertElementVisible(locator._visibleTextDiv("Out of range!"));
    deployMode.ClearJSONFieldValue("Price");
    deployMode.EnterJSONInputValue("Price", "800");

    agHelper.ClickButton("Insert");
    agHelper.AssertElementVisible(locator._spanButton("Run InsertQuery"));
    table.ReadTableRowColumnData(0, 0, 2000).then(($cellData) => {
      expect($cellData).to.eq("4"); //asserting serial column is inserting fine in sequence
    });
    table.ReadTableRowColumnData(0, 1, 200).then(($cellData) => {
      expect($cellData).not.to.eq("");
    });
  });

  it("13. Validate Drop of the Newly Created - jsonbooks - Table from Postgres datasource", () => {
    deployMode.NavigateBacktoEditor();
    ee.ExpandCollapseEntity("QUERIES/JS");
    ee.SelectEntityByName("dropTable");
    dataSources.RunQuery();
    dataSources.ReadQueryTableResponse(0).then(($cellData) => {
      expect($cellData).to.eq("0"); //Success response for dropped table!
    });
    ee.ExpandCollapseEntity("QUERIES/JS", false);
    ee.ExpandCollapseEntity("DATASOURCES");
    ee.ExpandCollapseEntity(dsName);
    ee.ActionContextMenuByEntityName(dsName, "Refresh");
    agHelper.AssertElementAbsence(ee._entityNameInExplorer("public.jsonbooks"));
    ee.ExpandCollapseEntity(dsName, false);
    ee.ExpandCollapseEntity("DATASOURCES", false);
  });

  it("14. Verify Deletion of all created queries", () => {
    dataSources.DeleteDatasouceFromWinthinDS(dsName, 409); //Since all queries exists
    ee.ExpandCollapseEntity("QUERIES/JS");
    ee.ActionContextMenuByEntityName("createEnum", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName("createTable", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName(
      "deleteAllRecords",
      "Delete",
      "Are you sure?",
    );
    ee.ActionContextMenuByEntityName("deleteRecord", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName("dropTable", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName("dropEnum", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName("getEnum", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName("insertRecord", "Delete", "Are you sure?");
    ee.ActionContextMenuByEntityName(
      "selectRecords",
      "Delete",
      "Are you sure?",
    );
    ee.ActionContextMenuByEntityName("updateRecord", "Delete", "Are you sure?");
  });

  //#endregion

  //#region JsonB Datatype

  //#endregion


  it("25. Verify Deletion of datasource", () => {
    deployMode.DeployApp();
    deployMode.NavigateBacktoEditor();
    ee.ExpandCollapseEntity("QUERIES/JS");
    dataSources.DeleteDatasouceFromWinthinDS(dsName, 200);
  });
});
