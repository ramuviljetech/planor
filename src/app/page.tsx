'use client'

import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material'
import {
  Security,
  Home,
  Assessment,
  PictureAsPdf,
  Folder,
  AttachMoney,
} from '@mui/icons-material'
import { useAuth } from './auth/AzureAuthProvider'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏢 Planör Portal
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
            onClick={handleGetStarted}
          >
            {isAuthenticated ? 'Dashboard' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Property Asset
          </Typography>
          <Typography variant="h2" component="h1" gutterBottom sx={{ color: 'primary.main' }}>
            Management Portal
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', mb: 4 }}>
            Secure, full-stack property asset management portal built on modern web technologies and hosted entirely on Azure Cloud.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none',
              borderRadius: 2,
            }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Button>
        </Box>

        {/* Features Grid */}
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            mb: 8,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
          }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <Security sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Azure AD Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Secure role-based access control with Azure Active Directory integration.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <Home sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Properties & Buildings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage properties and buildings with metadata, documents, and visualizations.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <Assessment sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Maintenance Plans
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automated maintenance plan generation with cost breakdowns and summaries.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <PictureAsPdf sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                SmartPDF Viewer
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive floor plans with clickable hotspots and 360° visualization.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <Folder sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                File Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Centralized file repository using Azure Blob Storage with secure access.
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" component="h3" gutterBottom>
                Price List Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Global price list management with maintenance interval configuration.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Technology Stack */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Built with Modern Technologies
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                Next.js
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Frontend Framework
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                Node.js
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Backend Runtime
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>
                Cosmos DB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Database
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                Azure
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cloud Platform
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 6,
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Planör Portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', textAlign: 'center', mb: 2 }}>
              Secure property asset management portal built on Azure Cloud
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>
              © 2024 Planör Team. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
