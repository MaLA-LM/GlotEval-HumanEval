import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Collapse,
  Chip,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const HierarchyCheckboxTree = ({ data, onSelectionChange }) => {
  // Preprocess data if it's a nested object of languages
  const processedData = useMemo(() => {
    // If data is an object with language codes as keys, convert to standard format
    if (data && typeof data === 'object' && Object.keys(data).every(key => key.includes('_'))) {
      return {
        'languages': Object.keys(data)
      };
    }
    return data;
  }, [data]);

  // data is an object where each key is a parent and its value is an array of child values
  const [selectedItems, setSelectedItems] = useState({});
  const [openParents, setOpenParents] = useState({});

  // Initialize checked states and collapsed state for all parent items
  useEffect(() => {
    const initialSelectedItems = {};
    const initialOpen = {};
    Object.keys(processedData || {}).forEach((parent) => {
      // Initialize each parent with an empty object of children
      initialSelectedItems[parent] = {};
      (processedData[parent] || []).forEach((child) => {
        // Explicitly set each child to false
        initialSelectedItems[parent][child] = false;
      });
      // Parent collapsed by default.
      initialOpen[parent] = false;
    });
    setSelectedItems(initialSelectedItems);
    setOpenParents(initialOpen);
  }, [processedData]);

  // Call onSelectionChange whenever 'selectedItems' state updates
  useEffect(() => {
    if (onSelectionChange) {
      const selected = [];
      Object.keys(selectedItems).forEach((parent) => {
        Object.keys(selectedItems[parent]).forEach((child) => {
          if (selectedItems[parent][child]) {
            selected.push(child);
          }
        });
      });

      // Ensure we pass an array, not an object
      onSelectionChange(selected);
    }
  }, [selectedItems, onSelectionChange]);

  // Toggle collapse for a parent.
  const toggleCollapse = (parent) => {
    setOpenParents((prev) => ({ ...prev, [parent]: !prev[parent] }));
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <Box sx={{ width: 300 }}>
      <List>
        {Object.keys(processedData || {}).map((parent) => (
          <React.Fragment key={parent}>
            <ListItem>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={Object.values(selectedItems[parent] || {}).some(
                    (v) => v === true
                  )}
                  tabIndex={-1}
                  disableRipple
                  onChange={() => {
                    const newSelectedItems = { ...selectedItems };
                    if (!newSelectedItems[parent]) {
                      newSelectedItems[parent] = {};
                    }
                    const someChecked = Object.values(
                      newSelectedItems[parent]
                    ).some((v) => v === true);
                    Object.keys(newSelectedItems[parent]).forEach((child) => {
                      newSelectedItems[parent][child] = !someChecked;
                    });
                    setSelectedItems(newSelectedItems);
                    onSelectionChange(
                      Object.keys(newSelectedItems).flatMap((p) => 
                        Object.keys(newSelectedItems[p]).filter(
                          (child) => newSelectedItems[p][child]
                        )
                      )
                    );
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={`${capitalizeFirstLetter(parent)}${
                  parent !== "unseen" ? " Resource" : ""
                }`}
              />
              <IconButton onClick={() => toggleCollapse(parent)}>
                {openParents[parent] ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </ListItem>
            <Collapse in={openParents[parent]} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  pl: 4,
                  py: 1,
                }}
              >
                {(processedData[parent] || []).map((child) => (
                  <Chip
                    key={child}
                    label={child}
                    clickable
                    color={selectedItems[parent]?.[child] ? "primary" : "default"}
                    variant={selectedItems[parent]?.[child] ? "filled" : "outlined"}
                    onClick={() => {
                      const newSelectedItems = { ...selectedItems };
                      if (!newSelectedItems[parent]) {
                        newSelectedItems[parent] = {};
                      }
                      newSelectedItems[parent][child] = !newSelectedItems[parent]?.[child];
                      setSelectedItems(newSelectedItems);
                      
                      // Flatten selected items for onSelectionChange
                      const selected = Object.keys(newSelectedItems).flatMap(
                        (p) => Object.keys(newSelectedItems[p]).filter(
                          (c) => newSelectedItems[p][c]
                        )
                      );
                      onSelectionChange(selected);
                    }}
                    sx={{
                      m: 0.5,
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                ))}
              </Box>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default HierarchyCheckboxTree;
