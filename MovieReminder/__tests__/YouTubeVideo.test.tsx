import React from 'react';
import renderer from 'react-test-renderer';

import YouTubeVideo from '../src/screens/MovieScreen/YouTubeVideo';
import { Linking, TouchableOpacity } from 'react-native';

describe('<YouTubeVideo />', () => {
  const youtubeKey = 'test_key';
  let testRenderer: renderer.ReactTestRenderer;

  beforeEach(() => {
    testRenderer = renderer.create(
      <YouTubeVideo title="Test Title" youTubeKey={youtubeKey} />,
    );
  });

  it('renders corrently', () => {
    const snapshot = testRenderer.toJSON();
    expect(snapshot).toMatchSnapshot();
  });

  // TouchableOpacity Test
  it('opens url when it is pressed', () => {
    const spyFn = jest.spyOn(Linking, 'openURL');
    const touchableOpacity = testRenderer.root.findByType(TouchableOpacity);
    touchableOpacity.props.onPress();
    expect(spyFn).toHaveBeenCalledWith(
      `https://www.youtube.com/watch?v=${youtubeKey}`,
    );
  });
});
