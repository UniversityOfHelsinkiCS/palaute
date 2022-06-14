import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import useAuthorizedUser from '../../hooks/useAuthorizedUser'
import useUserDetails from '../../hooks/useUserDetails'
import { LoadingProgress } from '../LoadingProgress'

const UserPermissionsWindow = ({ isOpen, onClose }) => {
  const { authorizedUser, isLoading } = useAuthorizedUser()
  const { user, isLoading: isUserDetailsLoading } = useUserDetails(
    authorizedUser?.id,
    { enabled: isOpen && !isLoading },
  )

  const { t } = useTranslation()

  const getAccess = (access) => {
    if (access.admin) {
      return 'Admin'
    }
    if (access.write) {
      return 'Write'
    }
    if (access.read) {
      return 'Read'
    }
    return 'None'
  }

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{t('navBar:userInformation')}</DialogTitle>

      <DialogContent>
        {isLoading || isUserDetailsLoading ? (
          <LoadingProgress />
        ) : (
          <Box display="flex">
            <Box mr={8}>
              <Typography variant="button">
                <Tooltip title={t('userInformation:iamTooltip')}>
                  <span>{t('userInformation:iamGroups')}</span>
                </Tooltip>
              </Typography>
              <Box mb={2} />
              {user?.iamGroups
                ?.filter((iam) => iam.isRelevant)
                .map(({ iam }) => (
                  <Box fontFamily="monospace" fontSize={12}>
                    {iam}
                  </Box>
                ))}
              {!user?.iamGroups?.length > 0 && (
                <Box fontSize={12} fontFamily="monospace">
                  {t('userInformation:none')}
                </Box>
              )}
            </Box>
            <Box>
              <Typography variant="button">
                {t('userInformation:organisationAccess')}
              </Typography>
              <Box mb={1} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {t('userInformation:organisationCode')}
                      </TableCell>
                      <TableCell>{t('userInformation:access')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {user?.access?.map(({ organisation: org, access }) => (
                      <TableRow>
                        <TableCell>
                          <Tooltip title={org.name[user.language]}>
                            <Typography>{org.code}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{getAccess(access)}</TableCell>
                      </TableRow>
                    ))}
                    {!user?.access?.length > 0 && (
                      <TableRow>
                        <TableCell>
                          <Box fontSize={12} fontFamily="monospace">
                            {t('userInformation:none')}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserPermissionsWindow
