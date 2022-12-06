import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddBoxIcon from "@mui/icons-material/AddBox";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";

import { useTheme } from "@mui/material/styles";

import { Page } from "./ProductionTestsComponent";

import { DEFAULT_TEST_SET_ID, DEFAULT_TEST_SET_NAME } from "./constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

export const Landing = (props: any): JSX.Element => {
  const [testSets, setTestSets] = useState([]);
  const [selectedID, setSelectedID] = useState(DEFAULT_TEST_SET_ID);
  const [openDialog, setOpenDialog] = useState(false);
  const [testSetEntry, setTestSetEntry] = useState<any>({
    id: null,
    name: "Test Set"
  });

  const theme = useTheme();

  const handleRunButtonClick = () => {
    props.commitSelectedTestSetID(selectedID);
    props.changePage(Page.Progress);
  };

  const handleAddButtonClick = () => {
    setTestSetEntry({ id: null, name: "Test Set" });
    setOpenDialog(true);
  };

  const handleDeleteButtonClick = (id: string) => {
    const items = testSets.filter((item: any) => item && item.id !== id);
    setTestSets(items);
    props.commitCustomTestSets(items);
    setSelectedID(DEFAULT_TEST_SET_ID);
  };

  const handleEditButtonClick = () => {
    props.commitSelectedTestSetID(selectedID);
    props.changePage(Page.Edit);
  };

  const handleConfigButtonClick = () => {
    props.changePage(Page.Config);
  };

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    id: string,
    name: string
  ) => {
    setSelectedID(id);
    if (event.detail === 1) {
      return;
    }
    if (id === DEFAULT_TEST_SET_ID) {
      return;
    }
    setTestSetEntry({ id, name });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDialogDone = () => {
    const items: any = Array.from(testSets);
    if (testSetEntry.id) {
      const index = items.findIndex((item: any) => {
        return item.id === testSetEntry.id;
      });
      if (index !== -1) {
        items[index].name = testSetEntry.name;
        setTestSets(items);
        setSelectedID(items[index].id);
        props.commitCustomTestSets(items);
      }
    } else {
      const item = {
        name: testSetEntry.name,
        id: uuidv4(),
        tests: []
      };
      items.push(item);
      setTestSets(items);
      setSelectedID(item.id);
      props.commitCustomTestSets(items);
    }
    handleDialogClose();
  };

  const handleDialogDoneButtonClick = () => {
    handleDialogDone();
  };

  const handleDialogCancelButtonClick = () => {
    handleDialogClose();
  };

  const handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTestSetEntry({ ...testSetEntry, name: event.target.value });
  };

  const handleTextFieldKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.keyCode === 13) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      if (event.stopPropagation) {
        event.stopPropagation();
      }
      handleDialogDone();
    }
  };

  const generateListItems = (): JSX.Element[] => {
    return testSets?.map(({ id, name }: any, index: number) => {
      return (
        <ListItem
          key={id}
          divider
          secondaryAction={
            <IconButton
              color="error"
              edge="start"
              onClick={() => handleDeleteButtonClick(id)}
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton
            selected={selectedID === id}
            onClick={(event) => handleListItemClick(event, id, name)}
            sx={{ marginRight: "16px", padding: "0px 16px" }}
          >
            <ListItemText primary={name} />
          </ListItemButton>
        </ListItem>
      );
    });
  };

  useEffect(() => {
    const button = document.getElementById("addTestSetButton");
    if (button && openDialog === false) {
      button.blur();
    }
  }, [openDialog]);

  useEffect(() => {
    if (props.selectedTestSetID) {
      setSelectedID(props.selectedTestSetID);
    }
  }, [props.selectedTestSetID]);

  useEffect(() => {
    if (props.testRepo.sets) {
      setTestSets(props.testRepo.sets);
    }
  }, [props.testRepo]);

  return (
    <>
      <Canvas title={props.partNumber + " Production Tests"}>
        <Content
          sx={{
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div style={{ margin: "0px auto" }}>
            <Typography>Select Test Set</Typography>
          </div>
          <div
            style={{
              margin: "24px",
              overflow: "auto"
            }}
          >
            <List sx={{ padding: "0px" }}>
              <ListItem key={DEFAULT_TEST_SET_ID} divider>
                <ListItemButton
                  selected={selectedID === DEFAULT_TEST_SET_ID}
                  onClick={(event) =>
                    handleListItemClick(
                      event,
                      DEFAULT_TEST_SET_ID,
                      DEFAULT_TEST_SET_NAME
                    )
                  }
                  sx={{ padding: "0px 16px" }}
                >
                  <ListItemText primary={DEFAULT_TEST_SET_NAME} />
                </ListItemButton>
              </ListItem>
              {generateListItems()}
            </List>
            <Stack justifyContent="center" direction="row">
              <IconButton
                id="addTestSetButton"
                color="primary"
                onClick={() => handleAddButtonClick()}
                sx={{ marginTop: "8px" }}
              >
                <AddBoxIcon />
              </IconButton>
            </Stack>
          </div>
        </Content>
        <Controls
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Button
            onClick={() => handleRunButtonClick()}
            sx={{ width: "150px" }}
          >
            Run
          </Button>
          <Button
            variant="text"
            onClick={() => handleConfigButtonClick()}
            sx={{
              position: "absolute",
              top: "50%",
              left: "24px",
              transform: "translate(0%, -50%)"
            }}
          >
            <Typography variant="underline">Config</Typography>
          </Button>
          <Button
            variant="text"
            disabled={selectedID === DEFAULT_TEST_SET_ID}
            onClick={() => handleEditButtonClick()}
            sx={{
              position: "absolute",
              top: "50%",
              right: "24px",
              transform: "translate(0%, -50%)"
            }}
          >
            <Typography
              variant="underline"
              sx={{
                color:
                  selectedID === DEFAULT_TEST_SET_ID
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary
              }}
            >
              Edit
            </Typography>
          </Button>
        </Controls>
      </Canvas>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openDialog}
        onClose={handleDialogClose}
      >
        <DialogContent>
          <TextField
            fullWidth
            variant="standard"
            label="Name of Test Set"
            type="text"
            value={testSetEntry.name}
            onChange={handleTextFieldChange}
            onKeyDown={handleTextFieldKeyDown}
            InputLabelProps={{
              shrink: true
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleDialogCancelButtonClick()}
            sx={{ width: "100px" }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDialogDoneButtonClick()}
            sx={{ width: "100px" }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Landing;
