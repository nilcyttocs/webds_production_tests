import React, { useEffect, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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

import Typography from "@mui/material/Typography";

import { Color, Page } from "./widget_container";

const DEFAULT_TEST_SET_ID = "all";
const DEFAULT_TEST_SET_NAME = "All";

export const Landing = (props: any): JSX.Element => {
  const [testSets, setTestSets] = useState([]);
  const [selectedID, setSelectedID] = useState(DEFAULT_TEST_SET_ID);
  const [openDialog, setOpenDialog] = useState(false);
  const [testSetEntry, setTestSetEntry] = useState<any>({
    id: null,
    name: "Test Set"
  });

  const handleRunButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.commitSelectedTestSetID(selectedID);
    props.changePage(Page.Progress);
  };

  const handleAddButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setTestSetEntry({ id: null, name: "Test Set" });
    setOpenDialog(true);
  };

  const handleDeleteButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    const items = testSets.filter((item: any) => item && item.id !== id);
    setTestSets(items);
    props.commitCustomTestSets(items);
    setSelectedID(DEFAULT_TEST_SET_ID);
  };

  const handleEditButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    props.commitSelectedTestSetID(selectedID);
    props.changePage(Page.Edit);
  };

  const handleConfigButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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

  const handleDialogDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    handleDialogDone();
  };

  const handleDialogCancelButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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
              onClick={(event) => handleDeleteButtonClick(event, id)}
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton
            selected={selectedID === id}
            onClick={(event) => handleListItemClick(event, id, name)}
            sx={{ marginRight: "15px", padding: "0px 16px" }}
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
  }, []);

  useEffect(() => {
    if (props.testRepo.sets) {
      setTestSets(props.testRepo.sets);
    }
  }, [props.testRepo]);

  return (
    <>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          <Typography sx={{ textAlign: "center" }}>Select Test Set</Typography>
        </Box>
        <Box
          sx={{
            height: props.height + "px",
            boxSizing: "border-box",
            border: 1,
            borderRadius: 1,
            borderColor: Color.grey,
            padding: "8px",
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
          <IconButton
            id="addTestSetButton"
            color="primary"
            onClick={(event) => handleAddButtonClick(event)}
            sx={{ marginTop: "15px", marginLeft: "30px" }}
          >
            <AddBoxIcon />
          </IconButton>
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                label="Name of Test Set"
                value={testSetEntry.name}
                type="text"
                variant="standard"
                InputLabelProps={{
                  shrink: true
                }}
                onChange={handleTextFieldChange}
                onKeyDown={handleTextFieldKeyDown}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={(event) => handleDialogDoneButtonClick(event)}
                sx={{ width: "75px" }}
              >
                Done
              </Button>
              <Button
                onClick={(event) => handleDialogCancelButtonClick(event)}
                sx={{ width: "75px" }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button
            onClick={(event) => handleRunButtonClick(event)}
            sx={{ width: "100px" }}
          >
            Run
          </Button>
          <Button
            variant="text"
            onClick={(event) => handleConfigButtonClick(event)}
            sx={{
              position: "absolute",
              top: "5px",
              left: "0px",
              textTransform: "none"
            }}
          >
            <Typography variant="body2" sx={{ textDecoration: "underline" }}>
              Config
            </Typography>
          </Button>
          <Button
            variant="text"
            disabled={selectedID === DEFAULT_TEST_SET_ID}
            onClick={(event) => handleEditButtonClick(event)}
            sx={{
              position: "absolute",
              top: "5px",
              right: "0px",
              textTransform: "none"
            }}
          >
            {selectedID === DEFAULT_TEST_SET_ID ? (
              <Typography
                variant="body2"
                sx={{ color: Color.grey, textDecoration: "underline" }}
              >
                Edit
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ textDecoration: "underline" }}>
                Edit
              </Typography>
            )}
          </Button>
        </div>
      </Box>
    </>
  );
};
