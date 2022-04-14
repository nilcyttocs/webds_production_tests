import React, { useCallback, useEffect, useReducer, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";

import { Color, Page } from "./widget_container";

const reducer = (state: any, action: any): any => {
  switch (action.type) {
    case "SET": {
      return {
        ...state,
        [action.to]: action.from
      };
    }
    case "COPY": {
      const from = Array.from(state[action.from]);
      const item: any = from[action.fromIndex];
      const to = Array.from(state[action.to]);
      to.splice(action.toIndex, 0, { ...item, id: uuidv4() });
      return {
        ...state,
        [action.from]: from,
        [action.to]: to
      };
    }
    case "MOVE": {
      const from = Array.from(state[action.from]);
      const [item] = from.splice(action.fromIndex, 1);
      const to = Array.from(state[action.to]);
      to.splice(action.toIndex, 0, item);
      return {
        ...state,
        [action.from]: from,
        [action.to]: to
      };
    }
    case "REMOVE": {
      const from = Array.from(state[action.from]);
      from.splice(action.fromIndex, 1);
      return {
        ...state,
        [action.from]: from
      };
    }
    case "REORDER": {
      const from = Array.from(state[action.from]);
      const [item] = from.splice(action.fromIndex, 1);
      const to = from;
      to.splice(action.toIndex, 0, item);
      return {
        ...state,
        [action.to]: to
      };
    }
  }
};

export const Edit = (props: any): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, {
    library: [],
    testSet: []
  });
  const [dividerOffset, setDividerOffset] = useState(0);

  const handleDeleteButtonClick = useCallback(
    (droppableId: string, index: number) => {
      dispatch({
        type: "REMOVE",
        from: droppableId,
        fromIndex: index
      });
    },
    []
  );

  const handleDoneButtonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    const tests = state.testSet.map((item: any) => {
      return item.name;
    });
    const testSets = props.testRepo.sets.map((item: any) => {
      if (item.id === props.selectedTestSetID) {
        item.tests = tests;
      }
      return item;
    });
    props.commitCustomTestSets(testSets);
    props.changePage(Page.Landing);
  };

  const generateLibraryItems = (): JSX.Element[] => {
    return state.library?.map(({ id, name }: any, index: number) => {
      return (
        <Draggable key={id} draggableId={id} index={index}>
          {(provided: any, snapshot: any) => (
            <>
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  transform: snapshot.isDragging
                    ? provided.draggableProps.style?.transform
                    : "translate(0px, 0px)"
                }}
              >
                <ListItem divider>
                  <ListItemText primary={name} />
                </ListItem>
              </div>
              {snapshot.isDragging && (
                <div style={{ transform: "none !important" }}>
                  <ListItem divider>
                    <ListItemText primary={name} />
                  </ListItem>
                </div>
              )}
            </>
          )}
        </Draggable>
      );
    });
  };

  const generateTestSetItems = (): JSX.Element[] => {
    return state.testSet?.map(({ id, name }: any, index: number) => {
      return (
        <Draggable key={id} draggableId={id} index={index}>
          {(provided: any) => (
            <ListItem
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              divider
              secondaryAction={
                <IconButton
                  color="error"
                  edge="end"
                  onClick={() => handleDeleteButtonClick("testSet", index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={name} />
            </ListItem>
          )}
        </Draggable>
      );
    });
  };

  const handleOnDragEnd = (result: any) => {
    console.log(result);
    if (result.reason !== "DROP") {
      return;
    }

    if (!result.destination) {
      return;
    }

    let action: string;
    if (result.source.droppableId === result.destination.droppableId) {
      action = "REORDER";
    } else if (result.source.droppableId === "library") {
      action = "COPY";
    } else {
      action = "MOVE";
    }

    dispatch({
      type: action,
      from: result.source.droppableId,
      fromIndex: result.source.index,
      to: result.destination.droppableId,
      toIndex: result.destination.index
    });
  };

  useEffect(() => {
    const box = document.getElementById("testSetEditBox");
    if (box) {
      const offset = box.clientWidth / 2 + props.marginLeft;
      setDividerOffset(offset);
    }
  }, [state]);

  useEffect(() => {
    if (props.testRepo.sets) {
      const library = [...props.testRepo.common, ...props.testRepo.lib].map(
        (item: any) => {
          return {
            id: uuidv4(),
            name: item
          };
        }
      );
      dispatch({
        type: "SET",
        from: library,
        to: "library"
      });

      const selected = props.testRepo.sets.find(
        (item: any) => item.id === props.selectedTestSetID
      );
      const testSet = selected.tests.map((item: any) => {
        return {
          id: uuidv4(),
          name: item
        };
      });
      dispatch({
        type: "SET",
        from: testSet,
        to: "testSet"
      });
    }
  }, [props.testRepo]);

  return (
    <ThemeProvider theme={props.theme}>
      <Box sx={{ width: props.width + "px" }}>
        <Typography variant="h5" sx={{ height: "50px", textAlign: "center" }}>
          {props.partNumber} Production Tests
        </Typography>
        <Box sx={{ height: "25px" }}>
          <Typography sx={{ textAlign: "center" }}>edit test set</Typography>
        </Box>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Box
            id="testSetEditBox"
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
            <Divider
              orientation="vertical"
              sx={{
                position: "absolute",
                height: props.height - 16 - 2 + "px",
                left: dividerOffset + "px"
              }}
            />
            <Stack spacing={2} direction="row">
              <List sx={{ width: "50%", padding: "0px" }}>
                <ListItem key={uuidv4()} divider>
                  <ListItemText
                    primary="Library"
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
                <Droppable droppableId="library" isDropDisabled={true}>
                  {(provided: any) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {generateLibraryItems()}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </List>
              <List sx={{ width: "50%", padding: "0px" }}>
                <ListItem key={uuidv4()} divider>
                  <ListItemText
                    primary="Test Set"
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
                <Droppable droppableId="testSet">
                  {(provided: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        height:
                          Math.max(
                            props.height - 16 - 2 - 49,
                            state.library.length * 49
                          ) + "px"
                      }}
                    >
                      {generateTestSetItems()}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </List>
            </Stack>
          </Box>
        </DragDropContext>
        <div
          style={{
            marginTop: "20px",
            position: "relative",
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Button
            onClick={(event) => handleDoneButtonClick(event)}
            sx={{ width: "100px" }}
          >
            Done
          </Button>
        </div>
      </Box>
    </ThemeProvider>
  );
};
