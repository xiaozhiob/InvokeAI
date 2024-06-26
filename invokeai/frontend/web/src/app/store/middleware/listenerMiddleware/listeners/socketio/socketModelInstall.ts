import type { AppStartListening } from 'app/store/middleware/listenerMiddleware';
import { api, LIST_TAG } from 'services/api';
import { modelsApi } from 'services/api/endpoints/models';
import {
  socketModelInstallCancelled,
  socketModelInstallComplete,
  socketModelInstallDownloadProgress,
  socketModelInstallError,
} from 'services/events/actions';

export const addModelInstallEventListener = (startAppListening: AppStartListening) => {
  startAppListening({
    actionCreator: socketModelInstallDownloadProgress,
    effect: async (action, { dispatch }) => {
      const { bytes, total_bytes, id } = action.payload.data;

      dispatch(
        modelsApi.util.updateQueryData('listModelInstalls', undefined, (draft) => {
          const modelImport = draft.find((m) => m.id === id);
          if (modelImport) {
            modelImport.bytes = bytes;
            modelImport.total_bytes = total_bytes;
            modelImport.status = 'downloading';
          }
          return draft;
        })
      );
    },
  });

  startAppListening({
    actionCreator: socketModelInstallComplete,
    effect: (action, { dispatch }) => {
      const { id } = action.payload.data;

      dispatch(
        modelsApi.util.updateQueryData('listModelInstalls', undefined, (draft) => {
          const modelImport = draft.find((m) => m.id === id);
          if (modelImport) {
            modelImport.status = 'completed';
          }
          return draft;
        })
      );
      dispatch(api.util.invalidateTags([{ type: 'ModelConfig', id: LIST_TAG }]));
      dispatch(api.util.invalidateTags([{ type: 'ModelScanFolderResults', id: LIST_TAG }]));
    },
  });

  startAppListening({
    actionCreator: socketModelInstallError,
    effect: (action, { dispatch }) => {
      const { id, error, error_type } = action.payload.data;

      dispatch(
        modelsApi.util.updateQueryData('listModelInstalls', undefined, (draft) => {
          const modelImport = draft.find((m) => m.id === id);
          if (modelImport) {
            modelImport.status = 'error';
            modelImport.error_reason = error_type;
            modelImport.error = error;
          }
          return draft;
        })
      );
    },
  });

  startAppListening({
    actionCreator: socketModelInstallCancelled,
    effect: (action, { dispatch }) => {
      const { id } = action.payload.data;

      dispatch(
        modelsApi.util.updateQueryData('listModelInstalls', undefined, (draft) => {
          const modelImport = draft.find((m) => m.id === id);
          if (modelImport) {
            modelImport.status = 'cancelled';
          }
          return draft;
        })
      );
    },
  });
};
