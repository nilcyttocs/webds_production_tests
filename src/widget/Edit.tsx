import React, { useCallback, useEffect, useReducer, useState } from "react";

import { v4 as uuidv4 } from "uuid";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { Page } from "./ProductionTestsComponent";

import { CANVAS_ATTRS } from "./mui_extensions/constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

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
  const [listHeight, setListHeight] = useState(0);
  const [dividerHeight, setDividerHeight] = useState(0);
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

  const handleDoneButtonClick = () => {
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
                    : "translate(0px, 0px)",
                  padding: "0px 8px"
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
            <div style={{ padding: "0px 8px" }}>
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
            </div>
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
    setDividerOffset(CANVAS_ATTRS.WIDTH / 2);

    let height =
      document.getElementById("webds_production_tests_edit_content")!
        .clientHeight -
      document.getElementById("webds_production_tests_edit_content_label")!
        .clientHeight -
      24 * 3;
    setDividerHeight(height);

    height -=
      document.getElementById("webds_production_tests_edit_list_label")!
        .clientHeight + 1;
    setListHeight(height);
  }, []);

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
  }, [props.testRepo, props.selectedTestSetID]);

  return (
    <Canvas title={props.partNumber + " Production Tests"}>
      <Content
        id="webds_production_tests_edit_content"
        sx={{
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div
          id="webds_production_tests_edit_content_label"
          style={{ margin: "0px auto" }}
        >
          <Typography>Edit Test Set</Typography>
        </div>
        <div style={{ marginTop: "24px" }}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Divider
              orientation="vertical"
              sx={{
                position: "absolute",
                height: dividerHeight + "px",
                left: dividerOffset + "px"
              }}
            />
            <Stack spacing={3} direction="row" sx={{ borderStyle: "none" }}>
              <List sx={{ width: "50%", padding: "0px" }}>
                <ListItem
                  id="webds_production_tests_edit_list_label"
                  key={uuidv4()}
                  divider
                >
                  <ListItemText
                    primary="Library"
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
                <div
                  style={{
                    height: listHeight + "px",
                    overflow: "auto"
                  }}
                >
                  <Droppable droppableId="library" isDropDisabled={true}>
                    {(provided: any) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        {generateLibraryItems()}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </List>
              <List sx={{ width: "50%", padding: "0px" }}>
                <ListItem key={uuidv4()} divider>
                  <ListItemText
                    primary="Test Set"
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
                <div
                  style={{
                    height: listHeight + "px",
                    overflow: "auto"
                  }}
                >
                  <Droppable droppableId="testSet">
                    {(provided: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          height:
                            Math.max(listHeight, state.testSet.length * 49) +
                            "px"
                        }}
                      >
                        {generateTestSetItems()}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </List>
            </Stack>
          </DragDropContext>
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
        <Button onClick={() => handleDoneButtonClick()} sx={{ width: "150px" }}>
          Done
        </Button>
      </Controls>
    </Canvas>
  );
};

export default Edit;
