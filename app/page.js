'use client'

import { useState, useEffect } from 'react'
import { AppBar, Box, Stack, Typography, Button, Modal, TextField, Tabs, Tab, Toolbar, Checkbox } from '@mui/material'
import { firestore } from '@/firebase'
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [tabValue, setTabValue] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [selectedItems, setSelectedItems] = useState([]) // State to track selected items

  useEffect(() => {
    setIsMounted(true)
    updateInventory()
  }, [])

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleSearchChange = (e) => setSearchTerm(e.target.value)
  const handleTabChange = (event, newValue) => setTabValue(newValue)

  const handleSelectItem = (item) => {
    setSelectedItems(prevSelectedItems =>
      prevSelectedItems.includes(item)
        ? prevSelectedItems.filter(selected => selected !== item) // Remove item if already selected
        : [...prevSelectedItems, item] // Add item if not selected
    )
  }

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isMounted) {
    return null
  }

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column">
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Tracker
          </Typography>
          <Tabs value={tabValue} onChange={handleTabChange} textColor="inherit">
            <Tab label="Tracker" />
            <Tab label="Recipes" />
            <Tab label="Stats" />
          </Tabs>
        </Toolbar>
      </AppBar>

      {tabValue === 0 && (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2} mt={2}>
          <Box display="flex" justifyContent="center" alignItems="center" gap={2} mt={2}>
            <Button variant="contained" onClick={handleOpen} sx={{ marginBottom: '20px' }}>
              Add Manually
            </Button>
            <Button variant="contained" sx={{ marginBottom: '20px' }}>
              Scan to Add
            </Button>
          </Box>
          <TextField
            id="search-bar"
            label="Search Inventory"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: '50%', marginBottom: '20px' }}
          />
          <Box border="0.5px solid #333" width="60%">
            <Box bgcolor="#ADD8E6" p={2}>
              <Typography variant="h5" textAlign="center">
                Currently in Inventory
              </Typography>
            </Box>
            <Stack spacing={2} p={2} overflow="auto" height="475px">
              {filteredInventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#f0f0f0"
                  p={2}
                  borderRadius={1}
                >
                  <Box display="flex" alignItems="center">
                    <Checkbox
                      checked={selectedItems.includes(name)}
                      onChange={() => handleSelectItem(name)}
                    />
                    <Typography variant="body1">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                  </Box>
                  <Typography variant="body1">Quantity: {quantity}</Typography>
                  <Button variant="contained" color="secondary" onClick={() => removeItem(name)}>
                    Remove
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <Box display="flex" flexDirection="row" justifyContent="space-between" p={2}>
          <Box width="45%" display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">Inventory Items</Typography>
            <Stack spacing={2}>
              {filteredInventory.map(({ name }) => (
                <Box
                  key={name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  bgcolor="#f0f0f0"
                  p={2}
                  borderRadius={1}
                >
                  <Typography variant="body1">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Button
                    variant="contained"
                    color={selectedItems.includes(name) ? 'secondary' : 'primary'}
                    onClick={() => handleSelectItem(name)}
                  >
                    {selectedItems.includes(name) ? 'Selected' : 'Select'}
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box width="45%" bgcolor="#f5f5f5" p={2} borderRadius={1}>
            <Typography variant="h6">Selected Items</Typography>
            <Box p={2} bgcolor="#ffffff" border="1px solid #ddd" borderRadius={1} height="100%" width="100%">
              {selectedItems.length > 0 ? (
                selectedItems.map(item => (
                  <Typography key={item} variant="body1">{item}</Typography>
                ))
              ) : (
                <Typography variant="body1">No items selected</Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {tabValue === 2 && (
        <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" gap={2} mt={2}>
          <Typography variant="h6">Stats</Typography>
        </Box>
      )}

      <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button variant="outlined" onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}