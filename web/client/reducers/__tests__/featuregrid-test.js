/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const idFt1 = "idFt1";
const idFt2 = "idFt2";
let feature1 = {
    type: "Feature",
    geometry: {
        type: "Point",
        coordinates: [1, 2]
    },
    id: idFt1,
    properties: {
        someProp: "someValue"
    }
};
let feature2 = {
     type: "Feature",
     geometry: {
         type: "Point",
         coordinates: [1, 2]
     },
     id: idFt2,
     properties: {
         someProp: "someValue"
     }
 };
let newfeature3 = {
     type: "Feature",
     geometry: {
         type: "Point",
         coordinates: [1, 2]
     },
     _new: true,
     id: idFt2,
     properties: {
         someProp: "someValue"
     }
 };
const expect = require('expect');
const featuregrid = require('../featuregrid');
const {setFeatures, dockSizeFeatures, setLayer, toggleTool, customizeAttribute, selectFeatures, deselectFeatures, createNewFeatures,
    featureSaving, toggleSelection, clearSelection, MODES, toggleEditMode, toggleViewMode, saveSuccess, clearChanges, saveError, startDrawingFeature,
    deleteGeometryFeature, geometryChanged, setSelectionOptions, changePage, featureModified, setPermission} = require('../../actions/featuregrid');
const {featureTypeLoaded, featureClose} = require('../../actions/wfsquery');
const {changeDrawingStatus} = require('../../actions/draw');

const museam = require('json-loader!../../test-resources/wfs/museam.json');
describe('Test the featuregrid reducer', () => {

    it('returns original state on unrecognized action', () => {
        let state = featuregrid(1, {type: 'UNKNOWN'});
        expect(state).toBe(1);
    });
    it('default state', () => {
        let state = featuregrid(undefined, {type: 'UNKNOWN'});
        expect(state).toExist();
        expect(state.pagination).toExist();
        expect(state.select).toExist();
        expect(state.features).toExist();
    });

    it('selectFeature', () => {
        // TODO FIX this test or the reducer
        // single select
        let state = featuregrid( undefined, selectFeatures([1, 2]));
        expect(state.select).toExist();
        expect(state.select.length).toBe(1);
        expect(state.select[0]).toBe(1);
        state = featuregrid( state, selectFeatures([1, 2]));
        expect(state.select).toExist();
        expect(state.select.length).toBe(1);
        expect(state.select[0]).toBe(1);
        // check multiselect true, append false
        state = featuregrid(undefined, {type: 'UNKNOWN'});
        state = featuregrid({...state, multiselect: true}, selectFeatures([1, 2], false));
        expect(state.select).toExist();
        expect(state.select.length).toBe(1);
        expect(state.select[0]).toBe(1);

        // check multiselect true, append true
        state = featuregrid( state, selectFeatures([3], true));
        expect(state.select).toExist();
        expect(state.select.length).toBe(2);
        expect(state.select[1]).toBe(3);
    });

    it('clearSelection', () => {
        let state = featuregrid({select: [1, 2]}, clearSelection());
        expect(state.select).toExist();
        expect(state.select.length).toBe(0);
    });
    it('featureModified', () => {
        const features = [feature1, feature2];
        let updated = [{
            geometry: null,
            id: idFt2
        }, {
            name: "newName",
            id: idFt1
        }];
        let state = featuregrid({select: [1, 2]}, featureModified(features, updated));
        expect(state.changes.length).toBe(2);
        expect(state.select).toExist();
    });
    it('deselectFeature', () => {
        let state = featuregrid( {select: [1, 2], changes: []}, deselectFeatures([1]));
        expect(state.select).toExist();
        expect(state.select[0]).toBe(2);
    });

    it('toggleSelection', () => {
        let state = featuregrid( {select: [1, 2], multiselect: true, changes: []}, toggleSelection([1]));
        expect(state.select).toExist();
        expect(state.select[0]).toBe(2);
        expect(state.select.length).toBe(1);
        state = featuregrid( state, toggleSelection([2]));
        expect(state.select.length).toBe(0);
        state = featuregrid( state, toggleSelection([6]));
        expect(state.select.length).toBe(1);
        expect(state.select[0]).toBe(6);
        state = featuregrid( state, toggleSelection([6]));
        expect(state.select.length).toBe(0);
    });

    it('setFeatures', () => {
        let state = featuregrid( {}, setFeatures(museam.features));
        expect(state.features).toExist();
        expect(state.features.length).toBe(1);
    });
    it('dockSizeFeatures', () => {
        let state = featuregrid( {}, dockSizeFeatures(200));
        expect(state.dockSize).toBe(200);
    });
    it('toggleEditMode', () => {
        let state = featuregrid( {}, toggleEditMode());
        expect(state.multiselect).toBeTruthy();
        expect(state.mode).toBe(MODES.EDIT);
    });
    it('toggleViewMode', () => {
        let state = featuregrid( {}, toggleViewMode());
        expect(state.multiselect).toBeFalsy();
        expect(state.mode).toBe(MODES.VIEW);
    });
    it('featureSaving', () => {
        let state = featuregrid( {}, featureSaving());
        expect(state.saving).toBeTruthy();
        expect(state.loading).toBeTruthy();
    });
    it('saveSuccess', () => {
        let state = featuregrid( {}, saveSuccess());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeTruthy();
        expect(state.saving).toBeFalsy();
        expect(state.loading).toBeFalsy();
    });
    it('clearChanges', () => {
        let state = featuregrid( {select: [feature1, feature2]}, clearChanges());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeFalsy();
        expect(state.newFeatures.length).toBe(0);
        expect(state.changes.length).toBe(0);
    });
    it('createNewFeatures', () => {
        let state = featuregrid( {}, createNewFeatures([1]));
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saved).toBeFalsy();
        expect(state.newFeatures.length).toBe(1);
    });
    it('saveError', () => {
        let state = featuregrid( {}, saveError());
        expect(state.deleteConfirm).toBeFalsy();
        expect(state.saving).toBeFalsy();
        expect(state.loading).toBeFalsy();
    });
    it('setLayer', () => {
        let state = featuregrid( {}, setLayer("TEST_ID"));
        expect(state.selectedLayer).toBe("TEST_ID");
    });
    it('toggleTool', () => {
        let state = featuregrid( {}, toggleTool("toolA"));
        expect(state.tools).toExist();
        expect(state.tools.toolA).toBe(true);
        state = featuregrid( state, toggleTool("toolA"));
        expect(state.tools.toolA).toBe(false);
        state = featuregrid( state, toggleTool("toolA", "value"));
        expect(state.tools.toolA).toBe("value");
    });
    it('customizeAttribute', () => {
        let state = featuregrid( {}, customizeAttribute("attrA", "test", true));
        expect(state.attributes).toExist();
        expect(state.attributes.attrA).toExist();
        expect(state.attributes.attrA.test).toBe(true);
        // auto toggle
        state = featuregrid( state, customizeAttribute("attrA", "test"));
        expect(state.attributes.attrA.test).toBe(false);
        state = featuregrid( state, customizeAttribute("attrA", "test", "value"));
        expect(state.attributes.attrA.test).toBe("value");
    });
    it('startDrawingFeature', () => {
        let state = featuregrid( {drawing: true}, startDrawingFeature());
        expect(state.drawing).toBe(false);
    });
    it('setSelectionOptions({multiselect= false} = {})', () => {
        let state = featuregrid( {}, setSelectionOptions({}));
        expect(state.multiselect).toBe(false);
    });
    it('changePage', () => {
        let state = featuregrid( {}, changePage(1, 4));
        expect(state.pagination.size).toBe(4);
        expect(state.pagination.page).toBe(1);
    });
    it('setPermission', () => {
        let state = featuregrid( {}, setPermission({canEdit: true}));
        expect(state.canEdit).toBe(true);
    });
    it('featureClose', () => {
        let state = featuregrid( {pagination: {size: 3}}, featureClose());
        expect(state.drawing).toBe(false);
        expect(state.deleteConfirm).toBe(false);
        expect(state.pagination.size).toBe(3);
        expect(state.newFeatures.length).toBe(0);
        expect(state.changes.length).toBe(0);
        expect(state.select.length).toBe(0);
    });
    it('CHANGE_DRAWING_STATUS', () => {
        let state = featuregrid( {}, changeDrawingStatus("clean"));
        expect(state.drawing).toBe(false);
        state = featuregrid( {drawing: true, pagination: {size: 3}}, changeDrawingStatus("stop"));
        expect(state.drawing).toBe(true);
        expect(state.pagination.size).toBe(3);
    });
    it('DELETE_GEOMETRY_FEATURE', () => {
        let state = featuregrid( {newFeatures: []}, deleteGeometryFeature([feature1]));
        expect(state.changes.length).toBe(1);
        expect(state.newFeatures.length).toBe(0);
        state = featuregrid( {newFeatures: [newfeature3], changes: []}, deleteGeometryFeature([newfeature3]));
        expect(state.changes.length).toBe(0);
        expect(state.newFeatures.length).toBe(1);
    });
    it('GEOMETRY_CHANGED', () => {
        let state = featuregrid( {newFeatures: []}, geometryChanged([feature1]));
        expect(state.changes.length).toBe(1);
        expect(state.newFeatures.length).toBe(0);
        state = featuregrid( state, geometryChanged([feature1]));
        expect(state.changes.length).toBe(2);

    });
    it('featureTypeLoaded', () => {
        let state = featuregrid( {}, featureTypeLoaded("typeName", {
            original: {featureTypes: [
            {
                properties: [
                    {},
                    {localType: "Point"}
                ]
            }]}}));
        expect(state.localType).toBe("Point");

    });

});
